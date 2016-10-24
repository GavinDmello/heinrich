var router = {}
var config = require('./config.json')
var http = require('http')
var Network = require('./network')
var network = new Network()
var strategies = require('./strategies')
var serverListener = require('./health').eventListener
var servers = []
var loggerUtility = require('./utilities/logger')
var logger = new loggerUtility()
var genericUtility = require('./utilities/generic-utility')
var EE = require('events').EventEmitter
var status = new EE()
var alreadyFlagged = alreadyCheckDownTime = firstServerCheck = false
var noOfDownServers = 0
var nextTick = process.nextTick

serverListener.on('health', checkDownTime)

router.hitServers = function(request, cb) {
    request.servers = servers
    if (!firstServerCheck) {
        status.on('firstCheck', function(done) {
            nextTick(router.hitServers, request, cb)
        })
        return
    }

    if (servers.length === 0) {
        cb({ statusCode: 503 })
        return
    }

    switch (config.mode) {
        case 1:
            strategies.randomRouter.hitRandom(request, cb)
            break

        case 2:
            strategies.roundRobinRouter.hitRoundRobin(request, cb)
            break

        case 3:
            strategies.leastConnectionsRouter.hitLeastConnections(request, cb)
            break
    }
}

function checkDownTime(serverHealth) {
    servers = serverHealth.upServers

    var send = process.send || genericUtility.handleAction

    if (!firstServerCheck) {
        firstServerCheck = true
        status.emit('firstCheck', { ping: true })
    }

    if (!alreadyCheckDownTime) {
        var condition = serverHealth.downServers.length !== 0
        if (condition) {
            noOfDownServers = serverHealth.downServers.length
            alreadyFlagged = false
            alreadyCheckDownTime = true
            send({ type: 'downtime', health: serverHealth })
        }
    }

    if (serverHealth.downServers.length === 0 && !alreadyFlagged) {
        alreadyFlagged = true
        alreadyCheckDownTime = false
        noOfDownServers = serverHealth.downServers.length
        send({ type: 'reset', health: serverHealth })
    }

    if (serverHealth.downServers.length !== noOfDownServers) {
        noOfDownServers = serverHealth.downServers.length
        send({ type: 'healthchange', health: serverHealth })
    }
}


module.exports = router

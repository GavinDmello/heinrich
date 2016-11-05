var router = {}
var config = require('../config.json')
var http = require('http')
var Network = require('./network')
var network = new Network()
var strategies = require('../strategies')
var Health = require('./health')
var health = new Health()
var servers = []
var loggerUtility = require('../utilities/logger')
var logger = new loggerUtility()
var genericUtility = require('../utilities/generic-utility')
var EE = require('events').EventEmitter
var status = new EE()
var alreadyFlagged = alreadyCheckDownTime = firstServerCheck = false
var noOfDownServers = 0
var nextTick = process.nextTick

health.on('health', checkDownTime)
health.ping()

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
    
    if ((config.multiCore && process.env.NODE_ENV !== 'test') && !process.send){
        setTimeout(checkDownTime, serverHealth, 1000)
        return
    }
    servers = serverHealth.upServers

    var send = genericUtility.handleAction

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
            var msg = { type: 'downtime', health: serverHealth }
            config.multiCore && process.env.NODE_ENV !== 'test' ? process.send(msg) : send(msg)
        }
    }

    if (serverHealth.downServers.length === 0 && !alreadyFlagged) {
        alreadyFlagged = true
        alreadyCheckDownTime = false
        noOfDownServers = serverHealth.downServers.length
        var msg = { type: 'reset', health: serverHealth }
        config.multiCore && process.env.NODE_ENV !== 'test' ? process.send(msg) : send(msg)
    }

    if (serverHealth.downServers.length !== noOfDownServers) {
        noOfDownServers = serverHealth.downServers.length
        var msg = { type: 'healthchange', health: serverHealth }
        config.multiCore && process.env.NODE_ENV !== 'test' ? process.send(msg) : send(msg)
    }
}



module.exports = router
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
var mailerUtilty = require('./utilities/mailer')
var mailer = new mailerUtilty()
var EE = require('events').EventEmitter
var status = new EE()
var alreadyFlagged = false
var alreadyCheckDownTime = false
var firstServerCheck = false
var nextTick = process.nextTick

serverListener.on('health', function(serverHealth) {
    servers = serverHealth.upServers
    var send = process.send || mailer.handleAction

    if (!firstServerCheck) {
        firstServerCheck = true
        status.emit('firstCheck', { ping: true })
    }

    if (!alreadyCheckDownTime) {
        var condition = serverHealth.upServers.length === 0 || serverHealth.downServers.length !== 0
        if (condition) {
            alreadyFlagged = false
            alreadyCheckDownTime = true

            send({ type: 'downtime', health: serverHealth, mailer: mailer })
        }
    }

    if (serverHealth.downServers.length === 0 && !alreadyFlagged) {
        alreadyFlagged = true
        alreadyCheckDownTime = false
        send({ type: 'reset', mailer: mailer })
    }

})

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
            strategies.randomRouter.hitRandom(request, function(response) {
                cb(response)
            })
            break

        case 2:
            strategies.roundRobinRouter.hitRoundRobin(request, function(response) {
                cb(response)
            })
            break

        case 3:
            strategies.leastConnectionsRouter.hitLeastConnections(request, function(response) {
                cb(response)
            })
            break
    }
}


module.exports = router

/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var router = {}
var Pfade = require('pfade')
var pfade = new Pfade()
var cluster = require('cluster')
var config = pfade.require('config.json')
var http = require('http')
var Network = pfade.require('lib/network')
var network = new Network()
var strategies = pfade.require('strategies')
var Health = pfade.require('lib/health')
var health = new Health()
var servers = []
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()
var genericUtility = pfade.require('utilities/generic-utility')
var EE = require('events').EventEmitter
var status = new EE()
var SocketServer = pfade.require('lib/socket-server')
var sockerServer = new SocketServer()
var  alreadyCheckDownTime = firstServerCheck = false
var  alreadyFlagged = 0
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

    servers = serverHealth.upServers
    var msg

    if (!firstServerCheck) {
        firstServerCheck = true
        status.emit('firstCheck', { ping: true })
        msg = { type: 'normal', health: serverHealth }
    }

    if (!alreadyCheckDownTime || serverHealth.downServers.length > alreadyFlagged) {
        noOfDownServers = serverHealth.downServers.length
        alreadyFlagged = serverHealth.downServers.length
        alreadyCheckDownTime = true
        msg = { type: 'downtime', health: serverHealth }
    }

    if (alreadyCheckDownTime && serverHealth.downServers.length < alreadyFlagged ) {
        alreadyCheckDownTime = false
        msg = { type: 'reset', health: serverHealth }
    }

    // if message  has to be sent, it will be sent
    if (msg) {
        genericUtility.decider(msg)
    }


}

module.exports = router

var router = {}
var config = require('./config.json')
var http = require('http')
var Network = require('./network')
var network = new Network()
var strategies = require('./strategies')
var serverListener = require('./health').eventListener
var servers = []
var mailerUtilty = require('./utilities/mailer')
var mailer = new mailerUtilty()
var loggerUtility = require('./utilities/logger')
var logger = new loggerUtility()
var nextTick = process.nextTick

serverListener.on('health', function(serverHealth) {
    servers = serverHealth.upServers
    if (serverHealth.upServers.length === 0 || serverHealth.downServers.length != 0) {
        mailer.sendDownTimeMail({ downServers: serverHealth.downServers })
    }

    if (serverHealth.downServers.length === 0) {
        nextTick(mailer.resetFlag)
    }
})

router.hitServers = function(request, cb) {
    request.servers = servers

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

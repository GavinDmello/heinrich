var router = {}
var config = require('./config.json')
var http = require('http')
var Network = require('./network')
var network = new Network()
var strategies = require('./strategies')
var serverListener = require('./health').eventListener
var servers = []

serverListener.on('health', function(serverhealth) {
    // console.log('serverhealth', serverhealth)
    servers = serverhealth
})

router.hitServers = function(request, cb) {
    request.servers = servers
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

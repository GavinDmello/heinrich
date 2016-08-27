var router = {}
var config = require('./config')
var http = require('http')
var Network = require('./network')
var network = new Network()
var serverListener = require('./health').eventListener
var servers = []

serverListener.on('health', function(serverhealth) {
    servers = serverhealth
})

router.hitUrl = function(request, cb) {
    switch (config.mode) {
        case 1:
            this.hitRandom(request, function(response) {
                cb(response)
            })
            break

        case 2:
            this.hitRoundRobin(request, function(response) {
                cb(response)
            })
            break

        case 3:
            this.hitSticky(request, function(response) {
                cb(response)
            })
    }
}

router.hitRandom = function(request, cb) {
    var serverIndex = choseRandomServer(0, servers.length)

    if ( !servers[serverIndex] && !servers[serverIndex]) {
        console.log('No server available')
        cb(null)
        return
    }
    var hostInfo = { host: servers[serverIndex].host, port: servers[serverIndex].port }
    if (request.method === 'GET') {
        network.getRequest(hostInfo, request, function(response) {
            cb(response)
        })
    } else {
        network.postRequest(hostInfo, request, function(response) {
            cb(response)
        })
    }
}

function choseRandomServer(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}



module.exports = router

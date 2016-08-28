var router = {}
var config = require('./config.json')
var http = require('http')
var Network = require('./network')
var network = new Network()
var serverListener = require('./health').eventListener
var servers = []
var roundRobinIndex = 0

serverListener.on('health', function(serverhealth) {
    console.log('serverhealth', serverhealth)
    servers = serverhealth
})

router.hitServers = function(request, cb) {
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
    }
}

router.hitRandom = function(request, cb) {
    var hostInfo
    var serverIndex = choseRandomServer(0, servers.length - 1)
    console.log(serverIndex, servers)
    if (serverIndex === 0 || serverIndex) {
        hostInfo = { host: servers[serverIndex].host, port: servers[serverIndex].port }
    } else {
        cb(null)
        return
    }

    networkCall(hostInfo, request, function(response) {
        cb(response)
    })

}

router.hitRoundRobin = function(request, cb) {
    var hostInfo
    var serverIndex = roundRobinCalculation(0, servers.length)
    if (serverIndex === 0 || serverIndex) {
        hostInfo = { host: servers[serverIndex].host, port: servers[serverIndex].port }
    } else {
        cb(null)
        return
    }

    networkCall(hostInfo, request, function(response) {
        cb(response)
    })

}

function choseRandomServer(min, max) {
    if (servers.length !== 0) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    } else {
        return null
    }

}

function roundRobinCalculation(min, max) {
    if (servers.length !== 0) {
        return ((roundRobinIndex++) % (min + max))
    } else {
        return null
    }
}

function networkCall(hostInfo, request, cb) {
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

module.exports = router

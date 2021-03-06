/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var Network = require('../lib/network')
var network = new Network()

function roundRobin() {
    this.initialIndex = 0
    this.roundRobinThreshold = 1000
}

module.exports = roundRobin

roundRobin.prototype.hitRoundRobin = function hitRoundRobin(request, cb) {
    var hostInfo

    if (!this.roundRobinIndex) {
        this.roundRobinIndex = request.id === undefined ? 0 : request.id
        this.initialIndex = request.id
    }

    this.servers = request.servers
    var serverIndex = this.roundRobinIndexCalculation(0, this.servers.length)
    if (serverIndex === 0 || serverIndex) {
        hostInfo = { host: this.servers[serverIndex].host, port: this.servers[serverIndex].port }
    }

    network.sendRequest(hostInfo, request, function(response) {
        cb(response)
    })
}

roundRobin.prototype.roundRobinIndexCalculation = function roundRobinIndexCalculation(min, max) {
    if (this.roundRobinIndex === this.roundRobinThreshold) this.roundRobinIndex = this.initialIndex
    return ((this.roundRobinIndex++) % (min + max))
}

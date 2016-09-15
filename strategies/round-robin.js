var Network = require('../network')
var network = new Network()

function roundRobin() {}

module.exports = roundRobin

roundRobin.prototype.hitRoundRobin = function hitRoundRobin(request, cb) {
    var hostInfo

    if (!this.roundRobinIndex) {
        this.roundRobinIndex = request.id === undefined ? 0 : request.id
    }

    this.servers = request.servers
    var serverIndex = this.roundRobinIndexCalculation(0, this.servers.length)
    if (serverIndex === 0 || serverIndex) {
        hostInfo = { host: this.servers[serverIndex].host, port: this.servers[serverIndex].port }
    } else {
        cb(null)
        return
    }

    network.sendRequest(hostInfo, request, function(response) {
        cb(response)
    })
}

roundRobin.prototype.roundRobinIndexCalculation = function roundRobinIndexCalculation(min, max) {
    if (this.servers.length !== 0) {
        return ((this.roundRobinIndex++) % (min + max))
    } else {
        return null
    }
}


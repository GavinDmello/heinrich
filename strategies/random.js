var Network = require('../network')
var network = new Network()

function random() {}

module.exports = random

random.prototype.hitRandom = function hitRandom(request, cb) {
    var hostInfo
    this.servers = request.servers
    var serverIndex = this.chooseRandomServer(0, this.servers.length - 1)
    if (serverIndex === 0 || serverIndex) {
        hostInfo = { host: this.servers[serverIndex].host, port: this.servers[serverIndex].port }
    }

    network.sendRequest(hostInfo, request, function(response) {
        cb(response)
    })
}

random.prototype.chooseRandomServer = function chooseRandomServer(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

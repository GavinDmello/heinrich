/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var Network = require('../lib/network')
var network = new Network()
var allServers = require('../config.json').servers
var async = require('async')

function leastConnections() {
    this.initialize = false
    this._serverConnections = {}
}

module.exports = leastConnections

leastConnections.prototype.init = function(servers) {
    for (var i = 0; i < servers.length; i++) {
        this._serverConnections[servers[i].host + servers[i].port.toString()] = -1
    }
}

leastConnections.prototype.hitLeastConnections = function hitLeastConnections(request, cb) {
    var that = this
    var hostInfo

    if (!this.initialize) {
        this.init(allServers)
        this.initialize = true

    }

    this.selectLeastActive(request.servers, function(selectedServer) {
        if (selectedServer) {
            hostInfo = { host: selectedServer.host, port: selectedServer.port }
        }

        that._serverConnections[selectedServer.minifiedServerString]++
            network.sendRequest(hostInfo, request, function(response) {
                that._serverConnections[selectedServer.minifiedServerString]--
                    cb(response)
            })
    })

}

leastConnections.prototype.selectLeastActive = function selectLeastActive(onlineServers, cb) {
    var that = this
    var min
    var selectedServer = {}

    async.each(onlineServers, getLeastActive, getSelectedServer)

    function getLeastActive(_server, servercallback) {
        var minifiedServerString = _server.host + _server.port.toString()
        if (!min || (that._serverConnections[minifiedServerString] < min)) {
            selectedServer.host = _server.host
            selectedServer.port = _server.port
            selectedServer.minifiedServerString = minifiedServerString
            min = that._serverConnections[minifiedServerString]
        }
        servercallback()
    }

    function getSelectedServer() {
        cb(selectedServer)
        selectedServer = that = null
    }
}

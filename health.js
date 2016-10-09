var servers = require('./config.json').servers
var pingInterval = require('./config').pingInterval || 1000
var async = require('async')
var EE = require('events').EventEmitter
var serverTransmitter = new EE()
var tcpp = require('tcp-ping')
var downServers = []
var loggerUtility = require('./utilities/logger')
var logger = new loggerUtility()

if (process.env.NODE_ENV === 'test') {
    servers = [{
        host: 'httpbin.org',
        port: 80
    }]
}

// If no servers provided in the config then throw error
if (servers.length === 0) {
    throw new Error('Please provide the IPs of backend servers')
    return
}

module.exports = { eventListener: serverTransmitter, health: health }

function health() {}

health.prototype.ping = function() {
    var that = this
    downServers = []
    async.map(servers, getServerHealth, function(err, result) {
        if (!err) {
            result = result.filter(Boolean)
            serverTransmitter.emit('health', {
                upServers: result,
                downServers: downServers
            })
        }
        setTimeout(function() {
            that.ping()
        }, pingInterval)
    })

    function getServerHealth(server, callback) {

        tcpp.probe(server.host, server.port, function(err, available) {
            if (available) {
                callback(null, { host: server.host, port: server.port })
            } else {
                downServers.push({ host: server.host, port: server.port })
                callback()
            }
        })
    }
}

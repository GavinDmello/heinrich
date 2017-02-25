/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var Pfade = require('pfade')
var pfade = new Pfade()
var servers = pfade.require('config.json').servers
var pingInterval = pfade.require('config').pingInterval || 1000
var async = require('async')
var inherits = require('util').inherits
var EE = require('events').EventEmitter
var tcpp = require('tcp-ping')
var downServers = []
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()

// If no servers provided in the config then throw error
if (servers.length === 0) {
    throw new Error('Please provide the IPs of backend servers')
    return
}


module.exports = health

function health() {
    EE.call(this)
}

inherits(health, EE)

health.prototype.ping = function() {
    var that = this
    downServers = []
    async.map(servers, getServerHealth, asyncCallback)

    function asyncCallback(err, result) {

        if (!err) {
            result = result.filter(Boolean)

            // pub health to analytics
            that.emit('health', {
                upServers: result,
                downServers: downServers
            })
        }

        setTimeout(function timer() {
            that.ping()
        }, pingInterval)
    }

    function getServerHealth(server, callback) {

        tcpp.probe(server.host, server.port, function probeServer(err, available) {
            if (available) {
                callback(null, { host: server.host, port: server.port })
            } else {
                downServers.push({ host: server.host, port: server.port })
                callback()
            }
        })
    }
}

var Pfade = require('pfade')
var pfade = new Pfade()
var config = pfade.require('config.json')
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()
var socket, socketHost

if (!config.analytics.host || !config.analytics.port) {
    logger.error('Host or port not provided for analytics')
    throw new Error('Host or port not provided for analytics')
    return
}

function analytics() {
    socketHost = config.analytics.host + ':' + config.analytics.port.toString()
    if (!socket) {
        socket = require('socket.io-client')('http://' + socketHost, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10
        })
    }
}

module.exports = analytics

analytics.prototype.send = function(data) {
    socket.emit('health', data)
}

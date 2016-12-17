var Pfade = require('pfade')
var pfade = new Pfade()
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()
var config = pfade.require('config')
var analyticsPort = config.analytics.port
var socket, io
var healthData
var http = require('http')

function socketServer() {}

socketServer.prototype.sendHealthInfo = function(healthInfo) {
    healthData = healthInfo
    io.sockets.emit('health', healthInfo)
}

socketServer.prototype.sendRequestInfo = function(requestInfo) {
    io.sockets.emit('request', requestInfo)
}

socketServer.prototype.sendBlockedRequestInfo = function(blockedRequestInfo) {
    io.sockets.emit('request', blockedRequestInfo)
}

socketServer.prototype.sendConnectionsInfo = function(connectionInfo) {
    io.sockets.emit('connection', connectionInfo)
}

socketServer.prototype.sendErrorInfo = function(errorInfo) {
    io.sockets.emit('connection', errorInfo)
}

socketServer.prototype.startServer = function(serverInfo) {
    socket = http.createServer(socketServer)
    io = require('socket.io').listen(socket)

    socket.listen(analyticsPort, function() {
        logger.log('started socket server on port', analyticsPort)
    })
    io.sockets.on('connection', handleSocket)

    function handleSocket(socket) {
        if (serverInfo) socket.emit('serverInfo', serverInfo)
        if (healthData) socket.emit('health', healthData)
    }
}

module.exports = socketServer

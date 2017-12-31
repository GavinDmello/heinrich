/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var Pfade = require('pfade')
var pfade = new Pfade()
var fs = require('fs')
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()
var config = pfade.require('config')
var analyticsPort = config.analytics.port
var socket, io
var healthData
var requestData = {}
var http = require('http')
var express = require('express')
var app = express()
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var levelup = require('levelup')


function socketServer(request, response) {}

socketServer.prototype.sendHealthInfo = function(healthInfo) {
    healthData = healthInfo
    if (io && io.sockets) io.sockets.emit('health', healthInfo)
}

socketServer.prototype.sendRequestInfo = function(requestInfo) {
    requestData[requestInfo.pid] = requestInfo.requestsActive
    if (io && io.sockets) io.sockets.emit('requestInfo', requestData)
}

socketServer.prototype.sendBlockedRequestInfo = function(blockedRequestInfo) {
    if (io && io.sockets) io.sockets.emit('blocked', blockedRequestInfo)
}

socketServer.prototype.sendConnectionsInfo = function(connectionInfo) {
    if (io && io.sockets) io.sockets.emit('connection', connectionInfo)
}

socketServer.prototype.sendErrorInfo = function(errorInfo) {
    if (io && io.sockets) io.sockets.emit('connection', errorInfo)
}

socketServer.prototype.startServer = function(serverInfo) {
    var db = levelup('../users')
    var path = getRootPath() + '/dashboard'
    var urlencodedParser = bodyParser.urlencoded({ extended: false })
    db.put('test', 'test@123')

    socket = require('http').createServer(app)
    io = require('socket.io')(socket)
    app.use('/css/login.css', express.static(path + '/css/login.css'))
    app.use('/socket.io.js', express.static(path + '/socket.io.js'))


    app.get('/', function(req, res, next) {
        res.sendFile(path + '/index.html')
    })

    app.post('/main', urlencodedParser, function(req, res, next) {
        var body = req.body
        if (!body.username || !body.password) {
            res.status(404).send({
                success: false,
                message: 'Fields not sent'
            })
            return
        }

        db.get(body.username, checkPassword)

        function checkPassword(err, password) {
            if (err) {
                res.status(404).send({
                    success: false,
                    message : 'Incorrect username and password'
                })
                return
            } else {
                res.sendFile(path + '/main.html')
            }
        }

    })

    socket.listen(4200)
    io.sockets.on('connection', handleSocket)

    function handleSocket(socket) {
        if (serverInfo) socket.emit('serverInfo', serverInfo)
        if (healthData) socket.emit('health', healthData)
    }
}

function getRootPath() {
    var currentDir = __dirname.split('/')
    currentDir.pop()
    return currentDir.join('/')
}

module.exports = socketServer

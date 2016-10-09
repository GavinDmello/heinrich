var http = require('http')
var concat = require('concat-stream')
var loggerUtility = require('./utilities/logger')
var logger = new loggerUtility()

function network() {}

module.exports = network

network.prototype.getRequest = function(hostInfo, request, done) {

    request.headers.host = hostInfo.host + ':' + hostInfo.port

    callback = function(response) {
        response.on('error', function(error) {
            logger.error(error)
            done({ statusCode: 404 })
            return
        })
        response.pipe(concat(function(data) {
            data = checkType(data)
            done({ body: data, headers: response.headers, statusCode: response.statusCode })
        }))
    }

    var req = http.request({
        host: hostInfo.host,
        port: hostInfo.port,
        path: request.path || '/',
        headers: request.headers,
        method: request.method
    }, callback).end()
}


network.prototype.postRequest = function(hostInfo, request, done) {
    request.headers.host = hostInfo.host + ':' + hostInfo.port
    request.pipe(concat(function(data) {
        var req = http.request({
            host: hostInfo.host,
            port: hostInfo.port,
            path: request.url || '/',
            method: 'POST'
        }, callback)

        data = checkType(data)
        req.write(data)
        req.end()

    }))
    callback = function(response) {
        response.on('error', function(error) {
            logger.error(error)
            done({ statusCode: 404 })
        })
        response.pipe(concat(function(data) {
            data = checkType(data)
            done({ body: data, headers: response.headers, statusCode: response.statusCode })
        }))
    }
}

network.prototype.sendRequest = function(hostInfo, request, cb) {
    if (request.method === 'GET') {
        this.getRequest(hostInfo, request, function(response) {
            cb(response)
        })
    } else {
        this.postRequest(hostInfo, request, function(response) {
            cb(response)
        })
    }
}

function checkType(data) {
    if (typeof data !== 'string') {
        data = data.toString()
    }
    return data
}

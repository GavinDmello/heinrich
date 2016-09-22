var http = require('http')
var concat = require('concat-stream')

function network() {}

module.exports = network

network.prototype.getRequest = function(hostInfo, request, done) {

    request.headers.host = hostInfo.host + ':' + hostInfo.port

    callback = function(response) {
        response.pipe(concat(function(data) {
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
            path: request.path || '/',
            method: 'POST'
        }, callback)
        req.write(data)
        req.end()

    }))
    callback = function(response) {
        response.pipe(concat(function(data) {
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

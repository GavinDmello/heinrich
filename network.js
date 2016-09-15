var http = require('http')
var concat = require('concat-stream')

function network() {}

module.exports = network

network.prototype.getRequest = function(hostInfo, request, done) {

    request.headers.host = hostInfo.host + ':' + hostInfo.port

    var options = {
        host: hostInfo.host,
        port: hostInfo.port,
        path: request.path || '/',
        headers: request.headers,
        method: request.method
    };

    callback = function(response) {
        response.pipe(concat(function(data) {
            done(data)
        }))
    }

    var req = http.request(options, callback).end()
}


network.prototype.postRequest = function(hostInfo, request, done) {
    request.headers.host = hostInfo.host + ':' + hostInfo.port

    var options = {
        host: hostInfo.host,
        port: hostInfo.port,
        path: request.path || '/',
        method: 'POST'
    }
    request.pipe(concat(function(data) {
            var req = http.request(options, callback);
            req.write(body);
            req.end();

    }))
    callback = function(response) {
        response.pipe(concat(function(data) {
            done(data)
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

var http = require('http')
var concat = require('concat-stream')
var loggerUtility = require('./utilities/logger')
var logger = new loggerUtility()
var config = require('./config.json')
var limitBandwidth = config.limitBandwidth || {}
var Throttle = require('stream-throttle').Throttle

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
            done({
                body: data,
                statusCode: response.statusCode
            })
        }))
    }

    var req = http.request({
        host: hostInfo.host,
        port: hostInfo.port,
        path: request.path || '/',
        headers: request.headers,
        method: request.method
    }, callback)
    req.on('error', function(err) {
        logger.log('Error on request', err)
    })
    req.end()


}


network.prototype.postRequest = function(hostInfo, request, done) {
    request.headers.host = hostInfo.host + ':' + hostInfo.port

    if (limitBandwidth.upStream) {
        request = throttleStream(request, limitBandwidth.upStream)
    }

    request.pipe(concat(function(data) {
        var req = http.request({
            host: hostInfo.host,
            port: hostInfo.port,
            path: request.url || '/',
            method: 'POST'
        }, callback)
        req.on('error', function(err) {
            logger.log('Error while sending request', err)
        })

        data = checkType(data)
        req.write(data)

        req.end()

    }))
    callback = function(response) {
        response.on('error', function(error) {
            logger.error(error)
            done({ statusCode: 404 })
        })

        if (limitBandwidth.downStream) {
            response = throttleStream(response, limitBandwidth.downStream)
        }

        response.pipe(concat(function(data) {
            data = checkType(data)
            done({
                body: data,
                statusCode: response.statusCode
            })
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

function throttleStream(stream, rate) {
    stream.pipe(new Throttle({ rate: rate }))
    return stream
}
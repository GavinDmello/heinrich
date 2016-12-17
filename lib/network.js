var Pfade = require('pfade')
var pfade = new Pfade()
var http = require('http')
var concat = require('concat-stream')
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()
var config = pfade.require('config.json')
var Throttle = require('stream-throttle').Throttle
var genericUtility = pfade.require('utilities/generic-utility')

function network() {
    this.limitBandwidth = config.limitBandwidth || {}
}

module.exports = network

network.prototype.getRequest = function(hostInfo, request, done) {

    request.headers.host = hostInfo.host + ':' + hostInfo.port

    callback = function(response) {

        response.pipe(concat(function concatCallback(data) {
            data = checkType(data)
            done({
                body: data,
                statusCode: response.statusCode
            })
        }))
    }

    var req = http.get({
        host: hostInfo.host,
        port: hostInfo.port,
        path: request.path || '/',
        headers: request.headers,
        method: request.method
    }, callback).on('error', function(err) {
        logger.error('Error on get request', err)
        handleError(err, callback)
    })

}


network.prototype.postRequest = function(hostInfo, request, done) {
    var that = this
    request.headers.host = hostInfo.host + ':' + hostInfo.port

    if (this.limitBandwidth.upStream) {
        request = throttleStream(request, limitBandwidth.upStream)
    }

    request.pipe(concat(function concatCallback(data) {
        var req = http.request({
            host: hostInfo.host,
            port: hostInfo.port,
            path: request.url || '/',
            method: 'POST'
        }, callback)
        req.on('error', function(err) {
            logger.error('Error while sending request', err)
            handleError(err, callback)
        })

        data = checkType(data)
        req.write(data)
        req.end()

    }))

    callback = function(response) {

        if (that.limitBandwidth.downStream) {
            response = throttleStream(response, limitBandwidth.downStream)
        }

        response.pipe(concat(function concatCallback(data) {
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
        this.getRequest(hostInfo, request, function handleGet(response) {
            cb(response)
        })
    } else {
        this.postRequest(hostInfo, request, function handlePost(response) {
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

function handleError(err, callback) {

    // pub error to analytics
    genericUtility.decider({
        type: 'error',
        pid: process.pid,
        error: err
    })

    if (err.code === 'ETIMEDOUT') {
        if (err.syscall === 'connect') {
            callback({
                statusCode: 503
            })
        } else {
            callback({
                statusCode: 404
            })
        }
        return
    }
}

function throttleStream(stream, rate) {
    stream.pipe(new Throttle({ rate: rate }))
    return stream
}
/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var Pfade = require('pfade')
var pfade = new Pfade()
var http = require('http')
var https = require('https')
var concat = require('concat-stream')
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()
var config = pfade.require('config.json')
var Throttle = require('stream-throttle').Throttle
var genericUtility = pfade.require('utilities/generic-utility')
var requestsActive = 0


function network() {
    this.limitBandwidth = config.limitBandwidth || {}
    this.pool = new http.Agent
    this.concurrency = config.concurrency || 100

    relayRequestInfo()
    this.pool.maxSockets = this.concurrency
}

module.exports = network

network.prototype.getRequest = function(hostInfo, request, done) {
    requestsActive++
    request.headers.host = hostInfo.host + ':' + hostInfo.port

    callback = function callbackMethod(response) {

        response.pipe(concat(function concatCallback(data) {
            data = checkType(data)
            done({
                body: data,
                statusCode: response.statusCode
            })
            requestsActive--
        }))
    }

    var mod = http

    if (hostInfo.https) {
        mod = https
    }

    var req = mod.get({
        host: hostInfo.host,
        port: hostInfo.port,
        path: request.path || '/',
        headers: request.headers,
        method: request.method,
        pool : this.pool,
    }, callback).on('error', function requestError(err) {
        logger.error('Error on get request', err)
        handleError(err, callback)
    })
    req.end()

}


network.prototype.postRequest = function(hostInfo, request, done) {
    var that = this
    request.headers.host = hostInfo.host + ':' + hostInfo.port
    requestsActive++

    if (this.limitBandwidth.upStream) {
        request = throttleStream(request, limitBandwidth.upStream)
    }

    var mod = http

    if (hostInfo.https) {
        mod = https
    }

    request.pipe(concat(function concatCallback(data) {
        var req = http.request({
            host: hostInfo.host,
            port: hostInfo.port,
            headers : request.headers,
            path: request.url || '/',
            method: request.method,
            pool: this.pool
        }, callback)
        req.on('error', function requestError(err) {
            logger.error('Error while sending request', err)
            handleError(err, callback)
        })

        data = checkType(data)
        req.write(data)
        req.end()

    }))

    callback = function callbackMethod(response) {

        if (that.limitBandwidth.downStream) {
            response = throttleStream(response, limitBandwidth.downStream)
        }

        response.pipe(concat(function concatCallback(data) {
            data = checkType(data)
            done({
                body: data,
                statusCode: response.statusCode
            })
            requestsActive--
        }))
    }
}

network.prototype.sendRequest = function(hostInfo, request, cb) {
    switch(request.method) {
        case 'GET' :
            this.getRequest(hostInfo, request, function handleGet(response) {
                cb(response)
            })
            break
        
        case 'POST' :
        case 'PUT' :
        case 'DELETE':
            this.postRequest(hostInfo, request, function handlePost(response) {
                cb(response)
            })
            break

    }
}

function checkType(data) {
    if (typeof data !== 'string') {
        data = data.toString()
    }
    return data
}

function handleError(err, callback) {

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
    }

    // pub error to analytics
    genericUtility.decider({
        type: 'error',
        pid: process.pid,
        error: err
    })
    requestsActive--
}

// throttle the bandwidth of the upstream
function throttleStream(stream, rate) {
    stream.pipe(new Throttle({ rate: rate }))
    return stream
}

// start relaying service every 3 secs for now
function relayRequestInfo() {
    genericUtility.decider({
        type: 'requests',
        requestsActive: requestsActive,
        pid : process.pid
    })
    setInterval(relayRequestInfo, 3000)    
}

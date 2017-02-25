/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var Pfade = require('pfade')
var pfade = new Pfade()
var levelup = require('levelup')
var config = pfade.require('config.json')
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()
var genericUtility = pfade.require('utilities/generic-utility')

var rateLimiter = function() {
    this.rateLimitInterval = config.rateLimit ? (config.rateLimit.rateLimitInterval || 1000) : 1000
    if (config.multiCore) {
        var ExternalStore = pfade.require('external/redis')
        this.db = new ExternalStore()

    } else {
        this.db = levelup('./rates')
        this.db.on('error', function levelError(error) {
            logger.error(error)
        })
    }
}


module.exports = rateLimiter

rateLimiter.prototype.getLastRequestTime = function(clientHash, callback) {
    this.db.get(clientHash, callback)

}

rateLimiter.prototype.postRequestTime = function(clientHash) {
    this.db.put(clientHash, Date.now().toString())
}

rateLimiter.prototype.checkRequestForRate = function(params, callback) {

    var that = this

    this.getLastRequestTime(params.clientHash, checkLastRequestTime)

    function checkLastRequestTime(err, lastRequestTime) {
        if (lastRequestTime) {
            var timeDiff = (Date.now() - Number(lastRequestTime))

            if (timeDiff < that.rateLimitInterval) {
                callback({
                    forward: false,
                    response: params.response
                })


                // pub number of block
                genericUtility.decider({
                    type: 'error',
                    pid: process.pid,
                    error: err
                })
                return
            }
        }

        callback({
            forward: true,
            request: params.request,
            response: params.response
        })

        that.postRequestTime(params.clientHash)
    }
}

rateLimiter.prototype.closeDB = function(callback) {
    this.db.close(callback)
}

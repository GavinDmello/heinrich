var levelup = require('levelup')
var config = require('../config.json')
var loggerUtility = require('../utilities/logger')
var logger = new loggerUtility()

var rateLimiter = function() {
    this.rateLimitInterval = config.rateLimit ? (config.rateLimit.rateLimitInterval || 1000) : 1000
    if (config.multiCore && process.env.NODE_ENV !== 'test') {
        var ExternalStore = require('external/redis')
        this.db = new ExternalStore()

    } else {
        this.db = levelup('./rates')
        this.db.on('error', function(error) {
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

    this.getLastRequestTime(params.clientHash, function(err, lastRequestTime) {
        if (lastRequestTime) {
            var timeDiff = (Date.now() - Number(lastRequestTime))
            if (timeDiff < that.rateLimitInterval) {
                callback({
                    forward: false,
                    response: params.response
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
    })
}
var levelup = require('levelup')
var db = levelup('./rates')
var config = require('../config.json')
var rateLimitInterval = config.rateLimit ? (config.rateLimit.rateLimitInterval || 1000) : 1000
var rateLimiter = function() {}

db.on('error', function(error){
    console.log(error)
})

module.exports = rateLimiter

rateLimiter.prototype.getLastRequestTime = function(clientHash, callback) {
    db.get(clientHash, callback)

}

rateLimiter.prototype.postRequestTime = function(clientHash) {
    db.put(clientHash, Date.now().toString())
}

rateLimiter.prototype.checkRequestForRate = function(params, callback) {
	var that = this
    this.getLastRequestTime(params.clientHash, function(err, lastRequestTime) {
        if (lastRequestTime) {

        	var timeDiff = (Date.now() - Number(lastRequestTime))
            if (timeDiff < rateLimitInterval) {
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
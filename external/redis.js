var Pfade = require('pfade')
var pfade = new Pfade()
var Redis = require('ioredis')
var config = pfade.require('config.json')
var rateLimitConfig = config.rateLimit
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()

function redisClass() {

    if (!rateLimitConfig.host || !rateLimitConfig.port) {
    	throw new Error('External host or port not set in the config for rateLimiting')
    }
    this.redis = new Redis(rateLimitConfig.port, rateLimitConfig.host)
}

module.exports = redisClass

redisClass.prototype.put = function(clientHash, timeStamp) {
    this.redis.set(clientHash, timeStamp)
}

redisClass.prototype.get = function(clientHash, callback) {
    this.redis.get(clientHash, callback)
}
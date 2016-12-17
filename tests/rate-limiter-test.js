process.env.NODE_ENV = 'test';
var Pfade = require('pfade')
var helper = require('./helper')
var pfade = new Pfade(helper.getRootPath(__dirname))
var RateLimiter = pfade.require('lib/rate-limiter')
var rateLimiter = new RateLimiter()


//Requiring the dev-dependencies
var chai = require('chai')
var expect = chai.expect
var hash1 = '1234'

describe('testing rate limiting functions', () => {

    it('post request time and get', (done) => {
        rateLimiter.postRequestTime(hash1)
        rateLimiter.getLastRequestTime(hash1, (err, res) => {
            if (res) {
                expect(Number(res)).to.be.number
                done()
            }
        })

    })


    it('check rate', (done) => {
        rateLimiter.checkRequestForRate({ clientHash: hash1, request: {}, response: {} }, (res) => {
            if (res) {
                expect(res).to.have.any.keys('forward')
                done()
            }
        })

    })
})

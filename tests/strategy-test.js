var strategies = require('../strategies/index')
var random = strategies.randomRouter
var roundRobin = strategies.roundRobinRouter
var leastConn = strategies.leastConnectionsRouter

//Requiring the dev-dependencies
var chai = require('chai')
var expect = chai.expect

describe('testing status codes', () => {

    it('random selection test', (done) => {
        expect(random.chooseRandomServer(1, 10)).to.be.number
        done()
    })

    it('round robin selection test', (done) => {
        roundRobin.roundRobinIndex = 1
        roundRobin.roundRobinIndexCalculation(1, 5)
        expect(roundRobin.roundRobinIndexCalculation(1, 5)).to.equal(2)
        done()
    })
})

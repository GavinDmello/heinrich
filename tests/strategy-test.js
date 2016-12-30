/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

process.env.NODE_ENV = 'test';
var Pfade = require('pfade')
var helper = require('./helper')
var pfade = new Pfade(helper.getRootPath(__dirname))
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

    it('least connections test', (done) => {
        leastConn._serverConnections = { '1.1.1.180': 9, '1.1.1.190': 10 }
        leastConn.selectLeastActive([{
            host: '1.1.1.1',
            port: 80
        }, {
            host:'1.1.1.1',
            port: 90
        }], (select) => {
            expect('1.1.1.180', select.minifiedServerString)
            done()
        })

    })
})
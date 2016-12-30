/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var randomRouterClass = require('./random')
var randomRouter = new randomRouterClass()
var leastConnectionsRouterClass = require('./least-connections')
var leastConnectionsRouter = new leastConnectionsRouterClass()
var roundRobinRouterClass = require('./round-robin')
var roundRobinRouter = new roundRobinRouterClass()

module.exports = {
    randomRouter: randomRouter,
    leastConnectionsRouter: leastConnectionsRouter,
    roundRobinRouter: roundRobinRouter
}
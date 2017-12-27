/*
 * Heinrich - Reverse proxy
 * Copyright(c) 2016-present @GavinDmello
 * BSD Licensed
 */

var Pfade = require('pfade')
var pfade = new Pfade(__dirname)
var cluster = require('cluster')
var numCPUs = require('os').cpus().length;
var config = pfade.require('./config.json')
var loggerUtility = pfade.require('utilities/logger')
var logger = new loggerUtility()
var genericUtility = pfade.require('utilities/generic-utility')
var PORT = config.port || 3001
var router = pfade.require('lib/router')
var SocketServer = pfade.require('lib/socket-server')
var socketServer = new SocketServer()
var RateLimiter = pfade.require('lib/rate-limiter')
var showArt = pfade.require('lib/art')
var rateLimiter
var nextTick = process.nextTick
var pid = process.pid
var server, http
var regexForIPV6 = /^.*:/

cluster.schedulingPolicy = cluster.SCHED_RR

if (config.multiCore) {
    if (cluster.isMaster) {
        for (var i = 0; i < numCPUs; i++) {
            // Create a worker
            var worker = cluster.fork()
            worker.on('message', handleAction)

        }

        showArt()
        handleAnalytics()

        // restart if process dies
        cluster.on('exit', function exitCode(worker, code, signal) {
            logger.log('Worker died, restarting. check error logs')
            logger.error('worker dead', code, signal)
            cluster.fork()
        })

        setTimeout(function() {
            logger.log('starting server in multi core mode!')
            logger.log('creating', numCPUs, ' processes')
        }, 1000)

    } else {
        serverInit({ clusterId: cluster.worker.id })
    }
} else {
    showArt()
    setTimeout(function() {
        logger.log('starting server without worker processes')
    }, 1000)
    
    serverInit({}) // No cluster present so no Id
}

// Initializing the server
function serverInit(opts) {

    if (!opts.clusterId) handleAnalytics()

    // request handler
    function handleAnyRequest(request, response) {
        if (config.requestTimeout) {
            request.connection.setTimeout(config.requestTimeout * 1000)
        }

        var clientIp = request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress

        clientIp = clientIp.replace(regexForIPV6, '')

        var clientAddressIndex = config.blackListAddress.indexOf(clientIp)
        var userAgent = request.headers['user-agent']
        var blockedUserAgent = config.blockedUserAgent

        if ((clientAddressIndex > -1) || (blockedUserAgent.indexOf(userAgent) > -1)) {
            response.writeHead(500)
            response.end()
            return
        }

        if (!config.rateLimit) { // No rate limiting
            forwardRequest(request, response)
            return
        }



        var rateLimitedRoutes = config.rateLimit.rateLimitedRoutes
        if (rateLimitedRoutes && rateLimitedRoutes.indexOf(request.url) > -1) {
            if (!rateLimiter) rateLimiter = new RateLimiter()
            var clientHash = clientIp + request.url
            rateLimiter.checkRequestForRate({
                clientHash: clientHash,
                request: request,
                response: response
            }, rateLimitResponse)
        } else {
            forwardRequest(request, response)
        }


    }

    // forward request to the router
    function forwardRequest(request, response) {
        // publish request forwarded key
        request.id = opts.clusterId || undefined
        router.hitServers(request, function getResponse(lbResponse) {
            response.writeHead(lbResponse.statusCode)
            if (lbResponse) {
                response.end(lbResponse.body)
            } else {
                response.end()
            }
        })
    }

    // handle response from rate limit handler
    function rateLimitResponse(params) {
        var request = params.request
        var response = params.response

        if (params.forward) {
            forwardRequest(request, response)
        } else {
            response.writeHead(503) // server not available as rate limiting is on
            response.end()
        }
    }

    // start a http/https server depending on your needs
    if (config.https) {
        var fs = require('fs')
        http = require('https')
        if (!config.key || !config.cert) {
            logger.error('certificated not provided, Please test the key & certificate')
            process.exit(2)
        }
        var options = {
            key: fs.readFileSync(config.key),
            cert: fs.readFileSync(config.cert)
        }
        server = http.createServer(options, handleAnyRequest)

    } else {
        http = require('http')
        server = http.createServer(handleAnyRequest)
    }

    server.listen(PORT, function() {
        logger.log("Server listening on", PORT)
    })

}

// handle the action emitted by the client processes
function handleAction(msg) {
    genericUtility.handleAction(msg)
}

// handle analytics
function handleAnalytics() {
    if (config.analytics && config.analytics.port) {
        socketServer.startServer({
            pid: pid,
            processes: numCPUs,
            timeStamp: Date.now(),
            version: pfade.require('package.json').version
        })
    }
}
module.exports = server

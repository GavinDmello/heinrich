var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var config = require('./config.json')
var loggerUtility = require('./utilities/logger')
var logger = new loggerUtility()
var genericUtility = require('./utilities/generic-utility')
var PORT = config.port || 3001
var server, http
var router = require('./lib/router')
var RateLimiter = require('./lib/rate-limiter')
var rateLimiter = new RateLimiter()
var nextTick = process.nextTick
cluster.schedulingPolicy = cluster.SCHED_RR


if (config.multiCore && process.env.NODE_ENV !== 'test') {
    if (cluster.isMaster) {
        for (var i = 0; i < numCPUs; i++) {
            // Create a worker
            var worker = cluster.fork()
            worker.on('message', function(msg) {
                genericUtility.handleAction(msg)
            })

        }
        // restart if process dies
        cluster.on('exit', function(worker, code, signal) {
            logger.log('Worker died, restarting. check error logs')
            logger.error('worker dead', code, signal)
            cluster.fork()
        })

        logger.log('starting server in multi core mode!')
        logger.log('creating', numCPUs, ' processes')
    } else {
        serverInit({ clusterId: cluster.worker.id })
    }
} else {
    logger.log('starting server without worker processes')
    serverInit({}) // No cluster present so no Id
}

function serverInit(opts) {

    function handleAnyRequest(request, response) {
        if (config.requestTimeout) {
            request.connection.setTimeout(config.requestTimeout * 1000)
        }

        var clientIp = request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress

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

    function forwardRequest(request, response) {
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

}

module.exports = server
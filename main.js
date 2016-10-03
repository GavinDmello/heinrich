var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var config = require('./config.json')
var Health = require('./health').health
var health = new Health()
var loggerUtility = require('./utilities/logger')
var logger = new loggerUtility()
var mailerUtilty = require('./utilities/mailer')
var mailer = new mailerUtilty()
var PORT = config.port || 3001
var server, http
var router = require('./router')
var nextTick = process.nextTick
cluster.schedulingPolicy = cluster.SCHED_RR

if (config.multiCore) {
    if (cluster.isMaster) {
        for (var i = 0; i < numCPUs; i++) {
            // Create a worker
            var worker = cluster.fork()
            worker.on('message', function(msg) {
                mailer.handleAction(msg)
            })

        }
        // restart if process dies
        cluster.on('exit', function(worker, code, signal) {
            logger.log('Worker died, restarting. check error logs', worker)
            logger.error('worker dead', worker, code, signal)
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
    health.ping()

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
            clientAddressIndex = clientIp = blockedUserAgent = userAgent = null
            return
        }

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
    });

}

module.exports = server

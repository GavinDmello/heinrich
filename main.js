var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var config = require('./config.json')
cluster.schedulingPolicy = cluster.SCHED_RR

if (config.multiCore) {
    if (cluster.isMaster) {
        for (var i = 0; i < numCPUs; i++) {
            // Create a worker
            cluster.fork();
        }
        // restart if process dies
        cluster.on('exit', function(worker, code, signal) {
            cluster.fork();
        });
    } else {
        serverInit()
    }
} else {
    serverInit()
}



function serverInit() {
    var http
    var router = require('./router')
    var Health = require('./health').health
    var health = new Health()
    var PORT = config.port || 3001;
    var server

    health.ping()

    function handleAnyRequest(request, response) {
        if (config.requestTimeout) {
            request.connection.setTimeout(config.requestTimeout*1000)
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

        request.id = cluster.worker.id || undefined
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
            console.log('certificated not provided')
            process.exit(0)
        }
        var options = {
            key: fs.readFileSync(config.key),
            cert: fs.readFileSync(config.cert)
        }
        server = http.createServer(options, handleAnyRequest);

    } else {
        http = require('http')
        server = http.createServer(handleAnyRequest);
    }


    server.listen(PORT, function() {
        console.log("Server listening on", PORT);
    });

}

var config = require('./config.json')
var http
var router = require('./router')
var Health = require('./health').health
var health = new Health()
var PORT = config.port;
var server
health.ping()

function handleAnyRequest(request, response) {
    router.hitServers(request, function(lbResponse) {
    	// console.log(request.connection.remoteAddress)
    	if (lbResponse){
    		response.end(lbResponse)
    	} else {
    		response.writeHead(404)
    		response.end()
    	}

    })
}

if (config.https) {
    var fs = require('fs')
    http = require('https')
    console.log()
    if (!config.key || !config.cert) {
        console.log('certificated not provided')
        process.exit(0)
    }
    var options = {
        key: fs.readFileSync(config.key),
        cert: fs.readFileSync(config.cert)
    }
    server = http.createServer(options, handleAnyRequest);

} else  {
    http = require('http')
    server = http.createServer(handleAnyRequest);
}


server.listen(PORT, function() {
    console.log("Server listening on", PORT);
});

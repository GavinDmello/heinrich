var config = require('./config.json')
var http = require('http');
var router = require('./router')
var Health = require('./health').health
var health = new Health()
var PORT = config.port;

health.ping()

function handleAnyRequest(request, response) {
    router.hitServers(request, function(lbResponse) {
    	console.log(request.connection.remoteAddress)
    	if (lbResponse){
    		response.end(lbResponse)
    	} else {
    		response.writeHead(404)
    		response.end()
    	}
        
    })
}

var server = http.createServer(handleAnyRequest);

server.listen(PORT, function() {
    console.log("Server listening on", PORT);
});

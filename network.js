var http = require('http')
function network() {}

module.exports = network

network.prototype.getRequest = function(hostInfo, request, done) {

	request.headers.host = hostInfo.host+':'+hostInfo.port

    var options = {
        host: hostInfo.host,
        port: hostInfo.port,
        path: request.path || '/',
        headers: request.headers,
        method: request.method
    };

    callback = function(response) {
        var str = '';

        response.on('data', function(chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function() {
            console.log('response', str);
            done(str)
        });
    }

    http.request(options, callback).end();
}


network.prototype.postRequest = function(hostInfo, request, done) {
	request.headers.host = hostInfo.host+':'+hostInfo.port

    var options = {
        host: hostInfo.host,
        port: hostInfo.port,
        path: request.path || '/',
        method: 'POST'
    }

    var body = ''

    request.on('data', function(data) {
        body += data;
    });

    request.on('end', function() {
        var req = http.request(options, callback);

        req.write(body);
        req.end();
    });


    callback = function(response) {
        var str = ''

        response.on('data', function(chunk) {
            str += chunk;
        });

        response.on('end', function() {
            done(str)
        });
    }
}

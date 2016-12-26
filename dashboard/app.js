// app.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use('/static', express.static(__dirname + '/'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('health', function(data) {
    	console.log(data)
        io.sockets.emit('location',"hello from the server");
    });

});
console.log("Server listening on 4200")
server.listen(4200);
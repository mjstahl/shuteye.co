var express = require('express'),
	app = express(),
	io 	= require('socket.io').listen(app.listen(8001)),
    uuid = require('node-uuid');

app.enable('trust proxy');

var uuid = uuid();
app.get('/h', function(req, res) {
	res.redirect('/h/' + uuid());
});

var html = "<!DOCTYPE html>
<html>
    <head>
        <script src=\"js/signals.js\"></script>
        var webrtc = new WebRTC({
        	localVideoEl: 'localVideo',
        	remoteVideoEl: 'remotesVideo',
        	autoRequestMedia: true
        });
		webrtc.on('readyToCall', function() {
			webrtc.joinRoom(" + uuid + ")
		});
    </head>
    <body>
        <div id=\"localVideo\"></div>
        <div id=\"remotesVideos\"></div>
    </body>
</html>"

app.get('/h/:id', function(req, res) {
	res.set('Content-Type', 'text/html');
	res.send(new Buffer(html));
});

io.sockets.on('connection', function(client) {
	client.on('message', function(details) {
		var other = io.sockets.sockets[details.to];

		if (!otherClient) {
			return;
		}
		delete details.to;
		details.from = client.id;
		otherClient.emit('message', details);
	});

	client.on('join', function(name) {
		client.join(name);
		io.sockes.in(name).emit('joined', {
			room: name, 
			id: client.id
		});
	});

	function leave() {
		var rooms = io.sockets.manager.roomClients[client.id];
		for (var name in rooms) {
			if (name) {
				io.sockets.in(name.slice(1)).emit('left', {
					room: name,
					id: client.id
				});
			}
		}
	}

	client.on('diconnect', leave);
	client.on('leave', leave);

	client.on('create', function(name, callback) {
		callback = name;
		name = uuid();

		if (io.sockets.clients(name).length) {
			callback('taken');
		} else {
			client.join(name);
			if (callback) callback(null, name);
		}
	});
});

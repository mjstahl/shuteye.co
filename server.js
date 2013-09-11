#!/usr/bin/nodejs

// Written by Mark Stahl
// Copyright © 2013 Mark Stahl.
// Released under the terms of the AGPL (/legal/AGPL)

var app = require('express')(),
	crypto = require('crypto'),
	io 	= require('socket.io').listen(app.listen(8001));

app.enable('trust proxy');

// HTTP Handlers
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/faq', function(req, res) {
	res.sendfile(__dirname + '/faq.html');
});

app.get('/buy', function(req, res) {
	res.sendfile(__dirname + '/buy.html');
});

app.get('/j', function(req, res) {
	res.sendfile(__dirname + '/join.html');
});

app.get('/h', function(req, res) {
	res.redirect('/h/' + randomSHA1());
});

app.get('/h/:id', function(req, res) {
	res.sendfile(__dirname + '/pwd.html');
});

app.post('/purchase', function(req, res) {
	res.redirect('/h/' + randomSHA1());
});

app.post('/h/:id', function(req, res) {
	res.sendfile(__dirname + '/host.html')
});

app.all('*', function(req, res) {
	res.redirect('/buy');
});

// Utility Functions
function randomSHA1() {
	var seed = crypto.randomBytes(20);
	return crypto.createHash('sha1').update(seed).digest('hex');
}

// https://github.com/andyet/signalmaster
//
// Written by Henrik Joreteg.
// Copyright © 2013 by &yet, LLC.
// Released under the terms of the MIT License (/legal/MIT)

// Socket IO Events
io.sockets.on('connection', function(client) {
	client.on('message', function(details) {
		var other = io.sockets.sockets[details.to];

		if (!other) {
			return;
		}
		delete details.to;
		details.from = client.id;
		other.emit('message', details);
	});

	client.on('join', function(name) {
		client.join(name);
		io.sockets.in(name).emit('joined', {
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
			client.join(name);
	});
});

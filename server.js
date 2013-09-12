#!/usr/bin/nodejs

// Written by Mark Stahl
// Copyright © 2013 Mark Stahl.
// Released under the terms of the AGPLv3 (/legal/AGPL)

var SENDGRID_USR = "";
var SENDGRID_KEY = "";

var sendgrid = require('sendgrid')(SENDGRID_USR, SENDGRID_KEY);

var crypto = require('crypto'),
	fs = require('fs');

var express = require('express'),
	app = express(),
	bcrypt = require('bcrypt'),
	sqlite = require('sqlite3'),
	mustache = require('mustache'),
	io 	= require('socket.io').listen(app.listen(8001));

var db = new sqlite.cached.Database(__dirname + '/shuteye.db');

app.use(express.bodyParser());
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

app.get('/h/:id', function(req, res) {
	var VERIFY_HOST = 'SELECT * FROM shuteye WHERE host_id = ?';
	var stmt = db.prepare(VERIFY_HOST);
	stmt.get(req.params.id, function(err, row) {
		if (row == undefined) {
			res.redirect('/buy');
		} else {
			res.sendfile(__dirname + '/pwd.html');
		}
	});
});

app.get('/j/:id', function(req, res) {
	var FIND_SESSION = 'SELECT session_id FROM shuteye WHERE attendee_id = ?';
	var stmt = db.prepare(FIND_SESSION);
	stmt.get(req.params.id, function(err, row) {
		if (row == undefined) {
			res.redirect('/buy');
		} else {
			var page = fs.readFileSync(__dirname + '/join.html', 'utf8');
			var data = { roomName : row.session_id };
			var html = mustache.to_html(page, data);
			res.send(html);
		}
	});
});

var EMAIL_TEMPLATE = fs.readFileSync(__dirname + '/email_template.txt', 'ascii');
var HOST_URL = 'https://shuteye.co/h/';
var JOIN_URL = 'https://shuteye.co/j/';
var FROM_ADDR = 'mark@shuteye.co';

app.post('/purchase', function(req, res) {
	var count = req.body['session-count'],
		email = req.body['email'],
		password = req.body['password'],
		token = req.body['purchaseToken'];

	// process transaction with Stripe using 'token'
	// on success continue

	var hash = bcrypt.hashSync(password, 10),
		host = randomSHA1(),
		attendee = randomSHA1(),
		session = randomSHA1();

	var NEW_PURCHASE = 'INSERT INTO shuteye VALUES (?, ?, ?, ?, ?);';
	var stmt = db.prepare(NEW_PURCHASE);
	stmt.run(host, attendee, hash, count, session);
	stmt.finalize();

	var data = { host_url : HOST_URL + host,
				 join_url : JOIN_URL + attendee };
	var text = mustache.render(EMAIL_TEMPLATE, data);
	sendgrid.send({
  		to: email,
  		from: FROM_ADDR,
  		subject: 'Welcome to Shuteye!',
  		text: text
	});

	res.redirect('/h/' + host);
});

app.post('/h/:id', function(req, res) {
	var VERIFY_HOST = 'SELECT password, session_id FROM shuteye WHERE host_id = ?';
	var find = db.prepare(VERIFY_HOST);
	find.get(req.params.id, function(err, row) {
		if (row == undefined) {
			res.redirect('/buy');
		} else {
			if (!bcrypt.compareSync(req.body.password, row.password)) {
				res.redirect('/h/' + req.params.id);
			} else {
				var page = fs.readFileSync(__dirname + '/host.html', 'utf8');
				var data = { roomName : row.session_id };
				var html = mustache.to_html(page, data);
				res.send(html);
			}
		}
	});
});

app.all('*', function(req, res) {
	res.redirect('/buy');
});

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

// Utility Functions
function randomSHA1() {
	var seed = crypto.randomBytes(20);
	return crypto.createHash('sha1').update(seed).digest('hex');
}

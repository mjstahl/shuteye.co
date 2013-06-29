var http = require('http');
http.createServer(function (req, res) {
	res.writeHead(200, {'Context-Type': 'text/plain'});
	res.end("Hello World\n");
})
http.listen(8001);
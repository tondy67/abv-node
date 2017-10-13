/**
 * 
 */
const abv = require('../index.js');

const http = require('http') ; 
const port = 8080;

const requestHandler = function(req, res) {  
	console.log(req.url);
	res.end('Abv-node server!');
};

const server = http.createServer(requestHandler);

server.listen(port, function(err) {  
	if (err) return console.log(err);
	console.log('Abv-node is running on port ' + port);
});

abv.node(5000);
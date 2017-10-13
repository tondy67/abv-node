/** 
 * Abv-node websockets server
 * @module abv-node
 * thor --amount 1000 --messages 100 sock://localhost:5000/abv
 */
"use strict";

const MAX_SOCKETS = 32768;
const STR = 'string';

const ts = require('abv-ts')('abv:node');
const abv = require('abv-socket');
const Agent = require('./lib/agent.js');

const $clients = abv.socket.clients;
const $port = 8080|0;

let WebSocket = null;

try{
	WebSocket = require('uws');
}catch(e){
	ts.log('Fallback to sock');
	WebSocket = require('sock');
}

function AbvNode(opt)
{
	let opts = null;
	if (typeof opt === 'object'){
		opts = {
			verifyClient : (info, done) => {
				const org = info.origin;
				const host = info.req.headers.host;
				if(org && host && (host === org.split('://')[1])) done(true);
				else done(false,404,'Not found');
	      	},
	    	path: '/abv',
			server: opt
		};
	}else if (typeof opt === 'number'){
		opts = { port:opt };
	}else{
		opts = { port:$port };
	}
//ts.debug(opt);	
	const wss = new WebSocket.Server(opts);


	wss.on('connection', (sock, req) => {
		if ($clients.size > MAX_SOCKETS) return ts.warn('Max clients: ',MAX_SOCKETS);
		
		const client = new Agent(sock); 
		client.echo(client.c2m('id','',client.id));
		
		sock.isAlive = true;

		sock.on('pong', () => { sock.isAlive = true; });

		sock.on('message',(msg) => { client.process(msg); });
	});
	
	wss.on('error', (err) => { ts.debug(err); });

	

	const timer = setInterval(() => {
		$clients.forEach((client) => {
			if (!client.sock) return client.close();;
			if (client.sock.isAlive === false) return client.close();

			client.sock.isAlive = false;
			client.sock.ping('', false, true);
	  });
	}, 30000);
}

///

module.exports = {
	node: AbvNode,
	port: $port
};

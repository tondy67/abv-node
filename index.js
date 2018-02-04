/** 
 * Abvos node
 * @module abv-node
 * thor --amount 1000 --messages 100 sock://localhost:5000/abv
 */
"use strict";

const ts = require('abv-ts')('abv:node');
const fs = require('abv-vfs');
const socket = require('abv-socket');
const Conn = socket.Conn;
const Agent = require('./lib/Agent.js');

const $clients = socket.Socket.clients;
const $port = 8080|0;
const MAX_SOCKETS = 32768;

const timer = setInterval(() => {
	$clients.forEach((client) => {
		if (!client.sock) return client.close(19);
		if (client.sock.isAlive === false) return client.close(21);
		client.sock.isAlive = false;
		if (client.sock.ping)client.sock.ping('', false, true);
	});
	}, 30000);

class AbvNode extends Conn
{
	
	constructor (opt,wss)
	{
		super();
		const me = this;
		let opts = null;
		if (typeof opt === ts.OBJ){
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
		let srv = null;

		if (wss){
			srv = new wss.Server(opts);
		}else{
			srv = require('net').createServer();
			srv.listen($port, '0.0.0.0'); 
		}

		if (srv) ts.info('Waiting clients'); else return ts.error(61,'error');
		
		srv.on('connection', (sock, req) => {
			if ($clients.size > MAX_SOCKETS) return ts.warn('Max clients: ',MAX_SOCKETS);
			
			if (!wss) sock.send = sock.write;

			const client = new Agent(sock); 
			client.msg2srv = (msg) => me.process(msg);
			
			sock.isAlive = true;

			sock.on('pong', () => { sock.isAlive = true; });

			sock.on('message',(msg) => { client.process(msg); });

			sock.on('data',(msg) => { msg = msg.toString();client.process(msg); });

			sock.on('close',(c,r) => { ts.error(79,c,r); });

			sock.on('error',(err) => { ts.error(81,err); });
		});
		
		srv.on('error', (err) => { ts.error(84,err); });

		this.on('error', (err) => { ts.error(86,err); });
	}
	
	send(cmd,body,to)
	{
		$clients.forEach((client) => {//ts.debug(to,client.id);
			if (!client.sock) return client.close(92);
			if (client.id === to){
				client._send({ c: 'msg', f: '@0', t: to, b: body });
			}
	  });
	}
	
	port(){ return $port; }

	ips() { return fs.IPs(); }
	
}
///

module.exports = AbvNode;

/** 
 * Abvos node
 * @module abv-node
 * thor --amount 1000 --messages 100 sock://localhost:8080/abv
 * https://github.com/tondy67/abv-node
 */
"use strict";

const ts = require('abv-ts')('abv:Node');
//const fs = require('abv-vfs');
const {CSocket,Socket} = require('abv-socket');
const SAgent = require('./lib/SAgent.js');

const $clients = Socket.clients;
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

class AbvNode extends CSocket //Conn
{
	constructor (opt,mode='ws')
	{
		super();
		this.id = '@0';
		const me = this;
	//ts.debug(opt);	
		let srv = null, opts = null;

		if (mode === 'ws'){
			let wss = null;

			try{
				wss = require('uws');
			}catch(e){
				ts.log('Fallback to ws');
				wss = require('ws');
			}
			
			if (typeof opt === ts.OBJ){
				opts = {
					verifyClient : (info, done) => {
						const org = info.origin;
						const host = info.req.headers.host;
						if(org && host && (host === org.split('://')[1])) done(true);
						else done(false,404,'Not found');
					},
					path: '/abv',
					server: opt.server
				};
			}else if (typeof opt === 'number'){
				opts = { port:opt };
			}else{
				opts = { port:$port };
			}
			srv = new wss.Server(opts);
		}else{
			srv = require('net').createServer();
			srv.listen($port, '0.0.0.0'); 
		}

		if (srv){
			ts.info('Waiting clients'); 
		
			srv.on('connection', (sock, req) => {
				if ($clients.size > MAX_SOCKETS) 
					return ts.warn('Max clients: ',MAX_SOCKETS);
				
				if (mode === '') sock.send = sock.write; // net socket

				const client = new SAgent(sock); 
				client.msg2srv = (msg) => me.process(msg);
				
				sock.isAlive = true;

				sock.on('pong', () => { sock.isAlive = true; });

				sock.on('message',(msg) => { client.process(msg); });

				sock.on('data',(msg) => { client.process(msg.toString()); });

				sock.on('close',(c,r) => { ts.info(89,c,r); });

				sock.on('error',(err) => { ts.error(91,err); });
			});
			
			srv.on('error', (err) => { ts.error(94,err); });
		}
		this.on('error', (err) => { ts.error(96,err); });
		this.on('echo',(msg) => {
			var r = Date.now() + '';
			return r;
		});
	}
	
/*	send(cmd,body,to)
	{
		$clients.forEach((client) => {//ts.debug(to,client.id);
			if (!client.sock) return client.close(92);
			if (client.id === to){
				client._send({ c: 'msg', f: '@0', t: to, b: body });
			}
	  });
	}*/
	_send(msg, cb)
	{
		const me = this;
		let error = false;
		cb = typeof cb === ts.FN ? cb : false;
		
		const m = this.encode(msg);
	
		if (m === null){
			error = 'null';
			if (cb) return cb(error);
			return ts.error(123,error);
		}
		
		ts.debug(126,msg.c,msg.f,msg.t,msg.m);
		
		const client = $clients.get(msg.t);

		if (!client) return ts.error(130,msg.t);
		client.sock.send(m, (err) => {
			if (err) ts.error(132,err);
			if (cb) return cb(err);
		});
	}
	
	
	connect(){}
	
}
///

module.exports = AbvNode;

/**
 * Abvos server side socket
 */
"use strict";

const ts = require('abv-ts')('abv:node.SSocket');
const abv = require('abv-socket');
const crypto = require('crypto');
const hash = crypto.createHash('sha256');
const abvPublicKey = 'BAAuTRrAyDIh6WquBij3qZaoaAbkVz/87Zw1gjg8DUkIKMZlPXZQ3vNt3GHv62EQ1dSH2V5ZMeFdus3lsLxsluxO5wEyniA7FWC/lgLY/bqF9hCU+F6lF51SBqHbINbFx4TH1s5gNxDfd9x/6t++2rqvh+W0UydWBnyIOZPiugrrnsvpcw==';
const abvPrivateKey = 'AZUxoeIHsHmbWwKr3VsQ94yRDQWKfAyoqUu95586H+ikIhsgIUqkRKEoC7/o74b40KM1KDDp5OHfZS3orWoUNIjr';

const STR = 'string';
const pack = abv.socket.pack;
const clients = abv.socket.clients;
const rooms = abv.socket.rooms;

class SSocket extends abv.socket.Socket
{
	constructor(sock)
	{
		super(sock);

		const me = this;
		
		this.on('echo',(msg) => {
			me.send(msg);
		});

		this.on('msg',(msg) => {
			me.send(msg);
		});

		this.on('join',(msg) => {
			me.join(msg.t); 
		});
		
		this.on('leave',(msg) => {
			me.leave(msg.t); 
		});

		this.on('file',(msg) => {
			me.send(msg);
		});

		this.on('online',(msg) => {
			msg.b = clients.size;
			me.echo(msg);
		});

		this.on('auth',(msg) => {
//			me.auth(msg);
		});
	}
	
	send(msg)
	{
		const me = this;
		let all = null;

		if (!ts.is(msg.t,String)) msg.t = '';

		if (msg.t == ''){
			all = clients;
		}else if (msg.t.startsWith('@')){
			all = [clients.get(msg.t)];
		}else if (rooms.has(msg.t)){
			all = rooms.get(msg.t);
		}else{
			ts.debug(68,'no room: ' + msg.t);
			return;
		}
		
		msg.f = me.id;

		if (ts.is(msg.b,String))ts.debug(70,msg,clients.size);
		else if (ts.is(msg.b,ArrayBuffer))ts.debug(76,'[bin:'+msg.b.byteLength +']');
		
		const data = pack.encode(msg);	

		all.forEach((client) => {
			if (me.sock !== client.sock){
				client.sock.send(data,(err) => {
					if (err){
						ts.error(err);
						client.close();		
					}
				});
	//			if (client.sock.readyState === WebSocket.CLOSED) client.close();	
			}	
		}); 
	}

	auth(m)
	{
	}
}

module.exports = SSocket;

/**
 * Abvos server side agent
 */
"use strict";

const ts = require('abv-ts')('abv:SAgent');
const {SSocket,Socket} = require('abv-socket');

const $clients = Socket.clients;
const $rooms = Socket.rooms;

class SAgent extends SSocket
{
	constructor(sock)
	{
		super(sock);

		const me = this;
		
		this.on('echo',(msg) => me.send(msg));

		this.on('write',(msg) => me.send(msg));

		this.on('msg',(msg) => me.send(msg));

		this.on('join',(msg) => me.join(msg.t));
		
		this.on('leave',(msg) => me.leave(msg.t));

		this.on('file',(msg) => me.send(msg));

		this.on('online',(msg) => {
			const c = new Map();
			for (let [k,v] of $clients.entries()) c.set(k,v.info);
			msg.b = JSON.stringify([...c]);
			me._send(msg);
		});
		this.on('id',(msg) => {
			msg.f = '@0';
			msg.t = me.id;
			me.info = ts.fromString(msg.b);
			me._send(msg); 
			ts.debug(48,msg);
		});

		this.on('auth',(msg) => {
//			me.auth(msg);
		});

		this.on('error',(err) => { ts.error(55,err); });

	}
	// TODO: Server side Agent
}

module.exports = SAgent;

/**
 * Abvos server side agent
 */
"use strict";

const ts = require('abv-ts')('abv:node.Agent');
const socket = require('abv-socket');

class Agent extends socket.SSocket
{
	constructor(sock)
	{
		super(sock);
	}
	// TODO: Server side Agent
}

module.exports = Agent;

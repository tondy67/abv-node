/**
 * Abvos server side agent
 */
"use strict";

const ts = require('abv-ts')('abv:node.Agent');
const SSocket = require('./ssocket.js');

class Agent extends SSocket
{
	constructor(ws)
	{
		super(ws);
	}
	// TODO: Server side Agent
}

module.exports = Agent;

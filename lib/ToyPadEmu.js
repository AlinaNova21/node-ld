var _ = require('lodash')
var constants = require('./constants')
var EventEmitter = require('events').EventEmitter;

util.inherits(ToyPadEmu, EventEmitter);

function ToyPadEmu(opts){
	EventEmitter.apply(this)
	opts = opts || {}
	if(opts.transport) this.setTransport(opts.transport)
	constants.attach(this)
	this.hooks = []
	
	this.on('request',this.processRequest.bind(this))
}

ToyPadEmu.prototype._write = function(data){
	if(this.transport)
		this.transport.write(data)
	else
		throw new Error('Transport not set')
}

ToyPadEmu.prototype.setTransport = function(transport){
	var self = this
	this.transport = transport
	this.transport.on('data',function(data){
		this.emit('request', new Response(data))
	})
}

ToyPadEmu.prototype.response = function(cid,payload,cb){
	var res = new Response()
	res.cid = this.getID()
	res.payload = payload
	this._write(res.build())
}

ToyPadEmu.prototype.processRequest = function(req){
	var res = new Response()
	res.cid = req.cid
	res.cancel = function(){ res.abort = true }
	this.hooks.forEach(function(hook){
		hook(req,res,cb)
	})
	if(!res.abort)
		this._write(res.build())
}

ToyPadEmu.prototype.hook = function(type,cb){
	if(typeof type == 'function')
		this.hooks.push({
			type: 0,
			cb: type
		})
	else
		this.hooks.push({
			type: type,
			cb: cb
		})
}

module.exports = ToyPadEmu
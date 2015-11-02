var _ = require('lodash')
var constants = require('./constants')
var EventEmitter = require('events').EventEmitter;

util.inherits(ToyPad, EventEmitter);

function ToyPad(opts){
	EventEmitter.apply(this)
	opts = opts || {}
	if(opts.transport) this.setTransport(opts.transport)
	constants.attach(this)
	this.callbacks = {}
	this.lastid = 0x00

	this.getID = function(){
		return ++this.lastid % 255
	}

	this.on('response',this.processCallback.bind(this))
}

ToyPad.prototype._write = function(data){
	if(this.transport)
		this.transport.write(data)
	else
		throw new Error('Transport not set')
}

ToyPad.prototype.setTransport = function(transport){
	var self = this
	this.transport = transport
	this.transport.on('data',function(data){
		if(data[0] == 0x55)
			this.emit('response', new Response(data))
		if(data[0] == 0x56)
			this.emit('event', new Event(data))
	})
}

ToyPad.prototype.request = function(cmd,payload,cb){
	var req = new Request()
	req.cmd = cmd
	req.cid = this.getID()
	req.payload = payload
	this.registerCallback(req,cb)
	this._write(req.build())
}

ToyPad.prototype.registerCallback = function(req,cb){
	var cid = req.cid || req;
	this.callbacks[cid] = cb || function(){}
}

ToyPad.prototype.processCallback = function(resp){
	var cid = resp.cid
	var cb = callbacks[cid]
	if(cb)
	{
		cb(null,resp)
		delete callbacks[cid]
	}
}

ToyPad.prototype.Wake = function(cb){
	this.request(this.CMD_WAKE,new Buffer('(c) LEGO 2014'),cb)
}

ToyPad.prototype.Read = function(index,page,cb){
	this.request(this.CMD_READ,new Buffer([index,page]),cb)
}

ToyPad.prototype.Write = function(index,page,data,cb){
	var buf = new Buffer(6)
	buf[0] = index
	buf[1] = page
	data.copy(buf,2)
	this.request(this.CMD_WRITE,buf,cb)
}

module.exports = ToyPad
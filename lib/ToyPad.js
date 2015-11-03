var _ = require('lodash')
var constants = require('./constants')
var util = require('util')
var EventEmitter = require('events').EventEmitter;
var Event = require('./Event')
var Request = require('./Request')
var Response = require('./Response')

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
		self.emit('raw',data)
		if(data[0] == 0x55)
			self.emit('response', new Response(data))
		if(data[0] == 0x56)
			self.emit('event', new Event(data))
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
	console.log('callback registered',cid)
}

ToyPad.prototype.processCallback = function(resp){
	var cid = resp.cid
	var cb = this.callbacks[cid]
	if(cb)
	{
		cb(null,resp)
		delete this.callbacks[cid]
		console.log('callback processed',cid)
	}
}

ToyPad.prototype.wake = function(cb){
	this.request(this.CMD_WAKE,new Buffer('(c) LEGO 2014'),cb)
}

ToyPad.prototype.read = function(index,page,cb){
	this.request(this.CMD_READ,new Buffer([index,page]),cb)
}

ToyPad.prototype.write = function(index,page,data,cb){
	var buf = new Buffer(6)
	buf[0] = index
	buf[1] = page
	data.copy(buf,2)
	this.request(this.CMD_WRITE,buf,cb)
}

module.exports = ToyPad

var _ = require('lodash')
var constants = require('./constants')
var util = require('util')
var EventEmitter = require('events').EventEmitter;
var Event = require('./Event')
var Request = require('./Request')
var Response = require('./Response')
var Burtle = require('./Burtle')

util.inherits(ToyPad, EventEmitter);

function ToyPad(opts){
	EventEmitter.apply(this)
	opts = opts || {}
	if(opts.transport) this.setTransport(opts.transport)
	constants.attach(this)
	this.callbacks = {}
	this.lastid = 0x00
	this.burtle = new Burtle()
	this.burtle.init(0)

	this.getID = function(){
		return ++this.lastid % 256
	}

	this.errInvalid = opts.errInvalid || true

	this.on('response',this.processCallback.bind(this))
}

ToyPad.prototype._write = function(data){
	// console.log('_write',data)
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
	if(this.callbackDebug) console.log('callback registered',cid)
}

ToyPad.prototype.processCallback = function(resp){
	var cid = resp.cid
	var cb = this.callbacks[cid]
	var err = null
	if(cb)
	{
		delete this.callbacks[cid]
		if(this.errInvalid && (resp.payload[0] & 0xF))
			err = new Error('Invalid 0x'+resp.payload[0].toString(16))
		cb(err,resp)
		if(this.callbackDebug) console.log('callback processed',cid)
	}
}

ToyPad.prototype.wake = function(cb){
	this.request(this.CMD_WAKE,new Buffer('(c) LEGO 2014'),cb)
}

ToyPad.prototype.seed = function(seed,cb){
	this.burtle.init(seed)
	var b = new Buffer(8)
	b.fill(0)
	b.writeUInt32BE(seed,0)
	this.request(this.CMD_SEED,b,cb)
}

ToyPad.prototype.chal = function(data,cb){
	var b = new Buffer(8)
	b.fill(0)
	this.request(this.CMD_CHAL,b,cb)
}

ToyPad.prototype.color = function(p,r,g,b,cb){
	this.request(this.CMD_COL,new Buffer([p,r,g,b]),cb)
}

ToyPad.prototype.colorAll = function(r1,g1,b1,r2,g2,b2,r3,g3,b3,cb){
	this.request(this.CMD_COLAL,new Buffer([r1,g1,b1,r2,g2,b2,r3,g3,b3]),cb)	
}

ToyPad.prototype.fade = function(p,s,a,cb){
	this.request(this.CMD_FADE,new Buffer([p,s,c,r,g,b]),cb)	
}

ToyPad.prototype.fadeRandom = function(p,s,c,cb){
	this.request(this.CMD_FADRD,new Buffer([p,s,c]),cb)
}

ToyPad.prototype.fadeAll = function(s1,c1,r1,g1,b1,s2,c2,r2,g2,b2,s3,c3,r3,g3,b3,cb){
	this.request(this.CMD_FADAL,new Buffer([1,s1,c1,r1,g1,b1,1,s2,c2,r2,g2,b2,1,s3,c3,r3,g3,b3]),cb)
}

ToyPad.prototype.flash = function(c,r,g,b,cb){
	this.request(this.CMD_FLASH,new Buffer([c,r,g,b]),cb)	
}

ToyPad.prototype.flashAll = function(on1,off1,a1,r1,g1,b1,on2,off2,a2,r2,g2,b2,on3,off3,a3,r3,g3,b3,cb){
	this.request(this.CMD_FLSAL,new Buffer([1,on1,off1,a1,r1,g1,b1,1,on2,off2,a2,r2,g2,b2,1,on3,off3,a3,r3,g3,b3]),cb)
}

ToyPad.prototype.tagList = function(cb){
	this.request(this.CMD_TGLST,new Buffer([]),cb)
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

ToyPad.prototype.model = function(data,cb){
	this.request(this.CMD_MODEL,data,cb)
}

ToyPad.prototype.E1 = function(data,cb){
	this.request(this.CMD_E1,data,cb)
}

ToyPad.prototype.E5 = function(data,cb){
	this.request(this.CMD_E5,data,cb)
}

module.exports = ToyPad

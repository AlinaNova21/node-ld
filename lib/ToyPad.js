var constants = require('./constants')
var util = require('util')
var EventEmitter = require('events').EventEmitter;
var Event = require('./Event')
var Request = require('./Request')
var Response = require('./Response')
var Burtle = require('./Burtle')
var transports = {
	get HIDTransport(){
		return require('../transports/hid')
	},
	get LibUSBTransport(){
		return require('../transports/libusb')
	}
}

util.inherits(ToyPad, EventEmitter);

function ToyPad(opts){
	EventEmitter.apply(this)
	opts = opts || {}
	if(!opts.transport && opts.transport !== false)
	{
		if(process.platform == 'linux')
			opts.transport = new transports.LibUSBTransport()
		else
			opts.transport = new transports.HIDTransport()
	}
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

ToyPad.prototype.rand = function(){
	return this.burtle.rand()
}

ToyPad.prototype.request = function(cmd,payload,cb){
	var req = new Request()
	req.cmd = cmd
	req.cid = this.getID()
	req.payload = payload
	this.registerCallback(req,cb)
	this.emit('request',req)
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

ToyPad.prototype.color = function(p,rgb,cb){
	rgb = hextorgb(rgb)
	this.request(this.CMD_COL,new Buffer([p,rgb.r,rgb.g,rgb.b]),cb)
}

ToyPad.prototype.colorAll = function(rgb1,rgb2,rgb3,cb){
	rgb1 = hextorgb(rgb1)
	rgb2 = hextorgb(rgb2)
	rgb3 = hextorgb(rgb3)
	this.request(this.CMD_COLAL,new Buffer([rgb1.r,rgb1.g,rgb1.b,rgb2.r,rgb2.g,rgb2.b,rgb3.r,rgb3.g,rgb3.b]),cb)
}

ToyPad.prototype.fade = function(p,s,rgb,cb){
	rgb = hextorgb(rgb)
	this.request(this.CMD_FADE,new Buffer([p,s,c,rgb.r,rgb.g,rgb.b]),cb)	
}

ToyPad.prototype.fadeRandom = function(p,s,c,cb){
	this.request(this.CMD_FADRD,new Buffer([p,s,c]),cb)
}

ToyPad.prototype.fadeAll = function(s1,c1,rgb1,s2,c2,rgb2,s3,c3,rgb3,cb){
	rgb1 = hextorgb(rgb1)
	rgb2 = hextorgb(rgb2)
	rgb3 = hextorgb(rgb3)
	this.request(this.CMD_FADAL,new Buffer([1,s1,c1,rgb1.r,rgb1.g,rgb1.b,1,s2,c2,rgb2.r,rgb2.g,rgb2.b,1,s3,c3,rgb3.r,rgb3.g,rgb3.b]),cb)
}

ToyPad.prototype.flash = function(c,rgb,cb){
	rgb = hextorgb(rgb)
	this.request(this.CMD_FLASH,new Buffer([c,rgb.r,rgb.g,rgb.b]),cb)	
}

ToyPad.prototype.flashAll = function(onoff1,a1,rgb1,onoff2,a2,rgb2,onoff3,a3,rgb3,cb){
	rgb1 = hextorgb(rgb1)
	rgb2 = hextorgb(rgb2)
	rgb3 = hextorgb(rgb3)
	this.request(this.CMD_FLSAL,new Buffer([1,onoff1[0],onoff1[1],a1,rgb1.r,rgb1.g,rgb1.b,1,onoff2[0],onoff2[1],a2,rgb2.r,rgb2.g,rgb2.b,1,onoff3[0],onoff3[1],a3,rgb3.r,rgb3.g,rgb3.b]),cb)
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

function hextorgb(hex){
	hex = hex.replace(/#/,'')
	var ret = 	[	parseInt('0x'+hex.slice(0,2))
				,	parseInt('0x'+hex.slice(2,4))
				,	parseInt('0x'+hex.slice(4,6))
				]
	ret.r = ret[0]; ret.g = ret[1]; ret.b = ret[2]
	return ret
}

module.exports = ToyPad

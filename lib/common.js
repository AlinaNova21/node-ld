var _ = require('lodash')

attachConstants(Request)

function attachConstants(obj){
	obj.CMD_ACTIVATE = 0xB0
	obj.CMD_AUTH1 = 0xB1
	obj.CMD_AUTH2 = 0xB3
	obj.CMD_LIGHT = 0xC0
	obj.CMD_LIGHT_FADE_SINGLE = 0xC2
	obj.CMD_LIGHT_FADE_ALL = 0xC6
	obj.CMD_PRESENSE = 0xD0
	obj.CMD_READ = 0xD2
	obj.CMD_WRITE = 0xD3
	obj.CMD_FIRST_SEEN = 0xD4
	obj.CMD_READ = 0xD2
}

function ToyPadCommon(){
	
	attachConstants(this)
	var callbacks = {}
	var lastid = 0x00

	this.init = function(cb){
		var req = new Request()
		req.cmd = this.CMD_ACTIVATE
		req.payload = new Buffer('(c) LEGO 2014')
		return req.build()
	}

	function id(){
		if(lastid == 0xFF)
			lastid = 0
		return ++lastid
	}
}

function Request(data){
	attachConstants(this)
	if(data && data instanceof Buffer) data = new Frame(data)
	if(data && data instanceof Frame) this.parse(data)
}

Request.prototype.parse = function(f){
	this.frame = f
	var p = f.payload
	this.cmd = p[0]
	this.cid = p[1]
	this.payload = p.slice(2) 
}

Request.prototype.build = function(){
	this.frame = this.frame || new Frame()
	var b = new Buffer(this.payload.length + 2)
	b[0] = this.cmd
	b[1] = this.cid
	this.payload.copy(b,2)
	this.frame.type = 0x55
	this.frame.payload = b;
	return this.frame.build()
}

function Response(data){
	if(data && data instanceof Buffer) data = new Frame(data)
	if(data && data instanceof Frame) this.parse(data)
}

Response.prototype.parse = function(f){
	this.frame = f
	var p = f.payload
	this.cid = p[0]
	this.payload = p.slice(1) 
}

Response.prototype.build = function(){
	this.frame = this.frame || new Frame()
	var b = new Buffer(this.payload.length + 1)
	b[0] = this.cid
	this.payload.copy(b,1)
	this.frame.type = 0x55
	this.frame.payload = b;
	return this.frame.build()
}

function Event(data){
	if(data && data instanceof Buffer) data = new Frame(data)
	if(data && data instanceof Frame) this.parse(data)
}

Event.prototype.parse = function(f){
	this.frame = f
	var p = f.payload
	this.payload = p
}

Event.prototype.build = function(){
	this.frame = this.frame || new Frame()
	// var b = new Buffer(this.payload.length + 1)
	// b[0] = this.cid
	// this.payload.copy(b,1)
	this.frame.type = 0x56
	this.frame.payload = this.payload;
	return this.frame.build()
}

function Frame(buf){
	if(buf) this.parse(buf)
}

Frame.prototype.parse = function(b){
	this.type = b[0]
	this.len = b[1]
	this.payload = b.slice(2,2+this.len)
	this.chksum = b[this.len + 2]
}

Frame.prototype.build = function(){
	var buf = new Buffer(32)
	buf.fill(0)
	buf[0] = this.type
	buf[1] = this.payload.length
	this.payload.copy(buf,2)
	buf[this.payload.length + 2] = _.reduce(buf,function(l,v){ return (l + v) % 256 },0)
	return buf
}

Frame.prototype.chksum = function(data){
    return data.reduce(function(l,v){ return (l + v) % 256 },0)
}

module.exports = {
	ToyPadCommon: ToyPadCommon,
	Frame: Frame,
	Request: Request,
	Response: Response,
	Event: Event
}
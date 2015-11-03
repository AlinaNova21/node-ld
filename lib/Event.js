var Frame = require('./Frame')

function Event(data){
	if(data && data instanceof Buffer) data = new Frame(data)
	if(data && data instanceof Frame) this.parse(data)
}

Event.prototype.parse = function(f){
	this.frame = f
	var p = f.payload
	// this.payload = p
	this.pad = p[0]
	this.index = p[2]
	this.dir = p[3]
	this.uid = p.slice(4).toString('hex')
}

Event.prototype.build = function(){
	var b = new Buffer(11)
	b[0] = this.pad || 0
	b[1] = 0
	b[2] = this.index || 0
	b[3] = this.dir & 0x1
	var uid = new Buffer(this.uid,'hex')
	uid.copy(b,0)
	this.frame = this.frame || new Frame()
	this.frame.type = 0x56
	this.frame.payload = b;
	return this.frame.build()
}

module.exports = Event
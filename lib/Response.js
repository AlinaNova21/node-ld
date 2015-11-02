var Frame = require('./Frame')

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

module.exports = Response
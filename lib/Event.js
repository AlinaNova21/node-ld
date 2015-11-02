var Frame = require('./Frame')

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
	this.frame.type = 0x56
	this.frame.payload = this.payload;
	return this.frame.build()
}

module.exports = Event
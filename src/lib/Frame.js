export default class Frame {
	constructor(buf){
		if(buf) this.parse(buf)
	}

	parse(b){
		this.type = b[0]
		this.len = b[1]
		this.payload = b.slice(2,2+this.len)
		this.chksum = b[this.len + 2]
	}

	build(){
		var buf = new Buffer(32)
		buf.fill(0)
		buf[0] = this.type
		buf[1] = this.payload.length
		this.payload.copy(buf,2)
		buf[this.payload.length + 2] = buf.reduce(function(l,v){ return (l + v) % 256 },0)
		return buf
	}
}
import Frame from './Frame'

export default class Event {
	constructor(data){
		if(data && data instanceof Buffer) data = new Frame(data)
		if(data && data instanceof Frame) this.parse(data)
		this.pad = data.pad || this.pad || 0
		this.index = data.index || this.index || 0
		this.dir = data.dir || this.dir || 0
		this.uid = data.uid || this.uid || 0
	}

	parse(f){
		this.frame = f
		var p = f.payload
		// this.payload = p
		this.pad = p[0]
		this.index = p[2]
		this.dir = p[3]
		this.uid = p.slice(4).toString('hex')
	}

	build(){
		var b = new Buffer(11)
		b[0] = this.pad || 0
		b[1] = 0
		b[2] = this.index || 0
		b[3] = this.dir & 0x1
		var uid = new Buffer(this.uid,'hex')
		uid.copy(b,4)
		// 0b04a3bdfa54428001100000e6
		this.frame = this.frame || new Frame()
		this.frame.type = 0x56
		this.frame.payload = b;
		return this.frame.build()
	}
}

import Frame from './Frame'
import constants from './constants'

export default class Request {
	constructor(data){
		constants.attach(this)
		if(data && data instanceof Buffer) data = new Frame(data)
		if(data && data instanceof Frame) this.parse(data)
	}

	parse(f){
		this.frame = f
		var p = f.payload
		this.cmd = p[0]
		this.cid = p[1]
		this.payload = p.slice(2) 
	}

	build(){
		this.frame = this.frame || new Frame()
		var b = new Buffer(this.payload.length + 2)
		b[0] = this.cmd
		b[1] = this.cid
		this.payload.copy(b,2)
		this.frame.type = 0x55
		this.frame.payload = b;
		return this.frame.build()
	}
}
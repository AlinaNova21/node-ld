import Frame from './Frame'

export default class Response {
	constructor(data){
		if(data && data instanceof Buffer) data = new Frame(data)
		if(data && data instanceof Frame) this.parse(data)
	}

	parse(f){
		this.frame = f
		var p = f.payload
		this.cid = p[0]
		this.payload = p.slice(1) 
	}

	build(){
		this.frame = this.frame || new Frame()
		var b = new Buffer(this.payload.length + 1)
		b[0] = this.cid
		this.payload.copy(b,1)
		this.frame.type = 0x55
		this.frame.payload = b;
		return this.frame.build()
	}

	preventDefault(){
		this._preventDefault = true
	}
	cancel(){
		this._cancel = true
	}
}
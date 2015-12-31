"use strict";
var constants = require('./constants')
var util = require('util')
var EventEmitter = require('events').EventEmitter;
var ld = require('../')

// util.inherits(ToyPadEmu, EventEmitter);

class ToyPadEmu extends EventEmitter {
	constructor(opts){
		opts = opts || {}
		super(opts)
		if(!opts.transport && opts.transport !== false)
			opts.transport = new ld.transports.RawTransport('/dev/hidg0')
		if(opts.transport) this.setTransport(opts.transport)
		constants.attach(this)
		this._tokens = [];
		this._hooks = []
		this._builtinHooks = []
		this._evqueue = []
		this.tea = new ld.TEA()
		this.on('request',this.processRequest.bind(this))
		setInterval(()=>{
			while(this._evqueue.length)
				wiiu.write(this._evqueue.shift().build())
		},500)
	}

	pad(pad){
		return this._tokens.filter(t=>t.pad == pad)
	}

	get pad1(){ return this.pad(1) }
	get pad2(){ return this.pad(2) }
	get pad3(){ return this.pad(3) }

	place(token, pad, index, uid) {
		if(this.pad(pad).length == (pad==1?1:3))
			return false;
		var nt = {
			index: index || this.tokens.map(v=>v.index).reduceRight((l,v,i)=>v>i?l-1:l,this.tokens.length),
			pad: pad,
			uid: uid,
			token: token
		}
		tagPlaceEvent(nt)
		this._tokens.push(nt)
		this._tokens.sort((a,b)=>b.index-a.index)
		return nt
	}

	remove(tag){
        if (typeof tag == 'number')
            tag = this._tokens.filter(v=> v.index == tag)[0]
		var ind = this._tokens.indexOf(tag)
		this._tokens.splice(ind,1)
		tagRemoveEvent(tag)
	}

	tagPlaceEvent(tag){
		var ev = new Event(tag)
		ev.dir = 0
		this._evqueue.push(ev)
	}

	tagRemoveEvent(tag){
		var ev = new Event(tag)
		ev.dir = 1
		this._evqueue.push(ev)
	}

	_write(data){
		if(this.transport)
			this.transport.write(data)
		else
			throw new Error('Transport not set')
	}

	setTransport(transport){
		this.transport = transport
		this.transport.on('data',(data)=>{
			this.emit('request', data)
		})
	}

	processRequest(data){
		var req = new Request(data)
		var res = new Response()
		res.cid = req.cid
		res.payload = new Buffer(0)
		var active = (h)=>h.cmd == req.cmd || h.cmd == 0
		this._hooks.filter(active).forEach((h)=>h.func(req,res))
		if(res._cancel) return
		if(!res._preventDefault)
			this._builtinHooks.filter(active).forEach((h)=>h.func(req,res))
		if(res._cancel) return
		wiiu.write(res.build())
	}

	hook(cmd,cb){
		if(typeof type == 'function'){ cb = cmd; cmd = 0 }
		this._hooks.push({
			cmd: cmd,
			cb: cb
		})
	}

	_hook(cmd,cb){
		if(typeof type == 'function'){ cb = cmd; cmd = 0 }
		this._builtinHooks.push({
			cmd: cmd,
			cb: cb
		})
	}

	addEvent(ev){
		this._evqueue.push(ev)
	}

	randomUID(){
		var uid = new Buffer(7)
		uid[0] = 0x0F
		for(var i=1;i<7;i++)
			uid[i] = Math.round(Math.random() * 256) % 256
		return uid.toString('hex').toUpperCase()
	}

	registerDefaults(){
		this._hook(this.CMD_WAKE,(req,res)=>{
			res.payload = new Buffer('286329204c45474f2032303134','hex')
			this._tokens.forEach(tagPlaceEvent)
		})

		this._hook(this.CMD_READ,(req,res)=>{
			var ind = req.payload[0]
			var page = req.payload[1]
			res.payload = new Buffer(17)
			res.payload[0] = 0
			var start = page * 4
			var token = this._tokens[ind]
			if(token)
				token.token.copy(res.payload,1,start,start + 16)
		})

		this._hook(this.CMD_MODEL,(req,res)=>{
			req.payload = decrypt(req.payload)
			var index = req.payload.readUInt32BE(0)
			var token = this._tokens[index]
			req.payload.copy(res.payload,1)
			var buf = res.payload.slice(1)
			res.payload = new Buffer(9)
			if(token)
				if(token.id)
					buf.writeUInt32BE(token.id || 0)
				else
					res.payload[0] = 0xF9
			else
				res.payload[0] = 0xF2
			tea.encrypt(buf).copy(res.payload,1)
		})

		this._hook(this.CMD_SEED,(req,res)=>{
			req.payload = decrypt(req.payload)
			var seed = req.payload.readUInt32LE(0)
			var conf = req.payload.readUInt32BE(4)
			prng.init(seed)
			console.log('SEED',seed)
			res.payload = new Buffer(8)
			res.payload.fill(0)
			res.payload.writeUInt32BE(conf,0)
			res.payload = encrypt(res.payload)
		})

		this._hook(this.CMD_CHAL,(req,res)=>{
			req.payload = decrypt(req.payload)
			var conf = req.payload.readUInt32BE(0)
			res.payload = new Buffer(8)
			var rand = prng.rand()
			console.log('RNG',rand.toString(16))
			res.payload.writeUInt32LE(rand,0)
			res.payload.writeUInt32BE(conf,4)
			res.payload = encrypt(res.payload)
		})
	}

	encrypt(buffer){
		return this.tea.encrypt(buffer)
	}

	decrypt(buffer){
		return this.tea.decrypt(buffer)
	}
	
}
module.exports = ToyPadEmu

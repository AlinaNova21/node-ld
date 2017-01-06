"use strict";
import constants from './constants'
import * as util from 'util'
import EventEmitter from 'events'
import Request from './Request'
import Response from './Response'
import Event from './Event'
import RawTransport from '../transports/raw'
import Burtle from './Burtle'
import TEA from './TEA'

export default class ToyPadEmu extends EventEmitter {
	constructor(opts) {
		opts = opts || {}
		super(opts)
		if (!opts.transport && opts.transport !== false)
			opts.transport = new RawTransport('/dev/hidg0')
		if (opts.transport) this.setTransport(opts.transport)
		constants.attach(this)
		this._tokens = [];
		this._hooks = []
		this._builtinHooks = []
		this._evqueue = []
		this.burtle = new Burtle()
		this.tea = new TEA()
		this.tea.key = new Buffer([0x55, 0xFE, 0xF6, 0xB0, 0x62, 0xBF, 0x0B, 0x41, 0xC9, 0xB3, 0x7C, 0xB4, 0x97, 0x3E, 0x29, 0x7B])
		this.on('request', this.processRequest.bind(this))
		setInterval(() => {
			while (this._evqueue.length) {
				console.log('EVENT:', this._evqueue[0])
				this._write(this._evqueue.shift().build())
			}
		}, 500)
	}

	pad(pad) {
		return this._tokens.filter(t => t.pad == pad)
	}

	get pad1() { return this.pad(1) }
	get pad2() { return this.pad(2) }
	get pad3() { return this.pad(3) }

	place(token, pad, index, uid) {
		if (this.pad(pad).length == (pad == 1 ? 1 : 3))
			return false;
		var nt = {
			index: index || this._tokens.map(v => v.index).reduceRight((l, v, i) => v > i ? l - 1 : l, this._tokens.length),
			pad: pad,
			uid: uid,
			token: token
		}
		this.tagPlaceEvent(nt)
		this._tokens.push(nt)
		this._tokens.sort((a, b) => b.index - a.index)
		return nt
	}

	remove(tag) {
		if (typeof tag == 'number')
			tag = this._tokens.filter(v => v.index == tag)[0]
		var ind = this._tokens.indexOf(tag)
		this._tokens.splice(ind, 1)
		this.tagRemoveEvent(tag)
	}

	tagPlaceEvent(tag) {
		var ev = new Event(tag)
		ev.dir = 0
		this._evqueue.push(ev)
	}

	tagRemoveEvent(tag) {
		var ev = new Event(tag)
		ev.dir = 1
		this._evqueue.push(ev)
	}

	_write(data) {
		if (this.transport)
			this.transport.write(data)
		else
			throw new Error('Transport not set')
	}

	setTransport(transport) {
		this.transport = transport
		this.transport.on('data', (data) => {
			this.emit('request', new Request(data))
		})
	}

	processRequest(req) {
		var res = new Response()
		res.cid = req.cid
		res.payload = new Buffer(0)
		var active = (h) => (h.cmd == req.cmd || h.cmd == 0)
		this._hooks.filter(active).forEach((h) => h.cb(req, res))
		if (res._cancel) return
		if (!res._preventDefault)
			this._builtinHooks.filter(active).forEach((h) => h.cb(req, res))
		if (res._cancel) return
		this.emit('response', res)
		this._write(res.build())
	}

	hook(cmd, cb) {
		if (typeof type == 'function') { cb = cmd; cmd = 0 }
		this._hooks.push({
			cmd: cmd,
			cb: cb
		})
	}

	_hook(cmd, cb) {
		if (typeof type == 'function') { cb = cmd; cmd = 0 }
		this._builtinHooks.push({
			cmd: cmd,
			cb: cb
		})
	}

	addEvent(ev) {
		this._evqueue.push(ev)
	}

	randomUID() {
		var uid = new Buffer(7)
		uid[0] = 0x04 // vendor id 04 = NXP
		uid[6] = 0x80 // for whatever reason the last byte of the UID is mostly 0x8*
		for(var i=1;i<6;i++)
			uid[i] = Math.round(Math.random() * 256) % 256
		return uid.toString('hex').toUpperCase()
	}

	registerDefaults() {
		this._hook(this.CMD_WAKE, (req, res) => {
			console.log('REQUEST (CMD_WAKE)')
			res.payload = new Buffer('286329204c45474f2032303134', 'hex')
			this._tokens.forEach(ev => this.tagPlaceEvent(ev))
		})

		this._hook(this.CMD_READ, (req, res) => {
			var ind = req.payload[0]
			var page = req.payload[1]
			console.log('REQUEST (CMD_READ): index:', ind, 'page', page)
			res.payload = new Buffer(17)
			res.payload[0] = 0
			var start = page * 4
			var token = this._tokens.find(t => t.index == ind)
			//console.log(token)
			if (token)
				token.token.copy(res.payload, 1, start, start + 16)

		})

		this._hook(this.CMD_MODEL, (req, res) => {
			req.payload = this.decrypt(req.payload)
			var index = req.payload.readUInt8(0)
			var conf = req.payload.readUInt32BE(4)
			console.log('REQUEST (CMD_MODEL): index:', index, 'conf:', conf)
			var token = this._tokens.find(t => t.index == index)
			//console.log(token)
			var buf = new Buffer(8)
			buf.writeUInt32BE(conf, 4)
			res.payload = new Buffer(9)
			if (token)
				if (token.token.id)
					buf.writeUInt32LE(token.token.id || 0, 0)
				else
					res.payload[0] = 0xF9
			else
				res.payload[0] = 0xF2
			//console.log('D4',index,buf)
			this.encrypt(buf).copy(res.payload, 1)
		})

		this._hook(this.CMD_SEED, (req, res) => {
			req.payload = this.decrypt(req.payload)
			var seed = req.payload.readUInt32LE(0)
			var conf = req.payload.readUInt32BE(4)
			this.burtle.init(seed)
			console.log('REQUEST (CMD_SEED): seed:', seed, 'conf', conf)
			res.payload = new Buffer(8)
			res.payload.fill(0)
			res.payload.writeUInt32BE(conf, 0)
			res.payload = this.encrypt(res.payload)
		})

		this._hook(this.CMD_CHAL, (req, res) => {
			req.payload = this.decrypt(req.payload)

			var conf = req.payload.readUInt32BE(0)
			console.log('REQUEST (CMD_CHAL): conf:', conf)
			res.payload = new Buffer(8)
			var rand = this.burtle.rand()
			//console.log('RNG',rand.toString(16))
			res.payload.writeUInt32LE(rand, 0)
			//console.log('response payload before encryption:',res.payload)
			res.payload.writeUInt32BE(conf, 4)
			res.payload = this.encrypt(res.payload)
		})
	}

	encrypt(buffer) {
		return this.tea.encrypt(buffer)
	}

	decrypt(buffer) {
		return this.tea.decrypt(buffer)
	}

}

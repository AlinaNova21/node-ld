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

		/*
		// start verbose logging of requests in a human readable way
		console.log('REQUEST', req.cmd, 'with payload', req.payload)
		if (req.cmd == this.CMD_WAKE) console.log('    => CMD_WAKE')
		if (req.cmd == this.CMD_SEED) console.log('    => CMD_SEED')
		if (req.cmd == this.CMD_CHAL) console.log('    => CMD_CHAL')
		if (req.cmd == this.CMD_COL) {
			console.log('    => CMD_COL')
			console.log('    => pad:', req.payload[0])
			console.log('    => red:', req.payload[1])
			console.log('    => green:', req.payload[2])
			console.log('    => blue:', req.payload[3])
		}
		if (req.cmd == this.CMD_GETCOL) {
			console.log('    => CMD_GETCOL')
			console.log('    => pad:', req.payload[0])
		}
		if (req.cmd == this.CMD_FADE) {
			console.log('    => CMD_FADE')
			console.log('    => pad:', req.payload[0])
			console.log('    => speed:', req.payload[1])
			console.log('    => cycles:', req.payload[2])
			console.log('    => red:', req.payload[3])
			console.log('    => green:', req.payload[4])
			console.log('    => blue:', req.payload[5])
		}
		if (req.cmd == this.CMD_FLASH) {
			console.log('    => CMD_FLASH')
			console.log('    => pad:', req.payload[0])
			console.log('    => color duration:', req.payload[1])
			console.log('    => white duration:', req.payload[2])
			console.log('    => cycles:', req.payload[3])
			console.log('    => red:', req.payload[4])
			console.log('    => green:', req.payload[5])
			console.log('    => blue:', req.payload[6])
		}
		if (req.cmd == this.CMD_FADRD) {
			console.log('    => CMD_FADRD - pad:', req.payload[0])
			console.log('    => speed:', req.payload[1])
			console.log('    => cycles:', req.payload[2])
		}
		if (req.cmd == this.CMD_FADAL) {
			console.log('    => CMD_FADAL - top pad speed:', req.payload[1])
			console.log('    => top pad cycles:', req.payload[2])
			console.log('    => top pad red:', req.payload[3])
			console.log('    => top pad green:', req.payload[4])
			console.log('    => top pad blue:', req.payload[5])
			console.log('    => left pad speed:', req.payload[7])
			console.log('    => left pad cycles:', req.payload[8])
			console.log('    => left pad red:', req.payload[9])
			console.log('    => left pad green:', req.payload[10])
			console.log('    => left pad blue:', req.payload[11])
			console.log('    => right pad speed:', req.payload[13])
			console.log('    => right pad cycles:', req.payload[14])
			console.log('    => right pad red:', req.payload[15])
			console.log('    => right pad green:', req.payload[16])
			console.log('    => right pad blue:', req.payload[17])
		}
		if (req.cmd == this.CMD_FLSAL) {
			console.log('    => CMD_FLSAL - top pad color duration:', req.payload[1])
			console.log('    => top pad white duration:', req.payload[2])
			console.log('    => top pad cycles:', req.payload[3])
			console.log('    => top pad red:', req.payload[4])
			console.log('    => top pad green:', req.payload[5])
			console.log('    => top pad blue:', req.payload[6])
			console.log('    => left pad color duration:', req.payload[8])
			console.log('    => left pad white duration:', req.payload[9])
			console.log('    => left pad cycles:', req.payload[10])
			console.log('    => left pad red:', req.payload[11])
			console.log('    => left pad green:', req.payload[12])
			console.log('    => left pad blue:', req.payload[13])
			console.log('    => right pad color duration:', req.payload[15])
			console.log('    => right pad white duration:', req.payload[16])
			console.log('    => right pad cycles:', req.payload[17])
			console.log('    => right pad red:', req.payload[18])
			console.log('    => right pad green:', req.payload[19])
			console.log('    => right pad blue:', req.payload[20])
		}
		if (req.cmd == this.CMD_COLAL) {
			console.log('    => CMD_COLAL - top pad red:', req.payload[1])
			console.log('    => top pad green:', req.payload[2])
			console.log('    => top pad blue:', req.payload[3])
			console.log('    => left pad red:', req.payload[5])
			console.log('    => left pad green:', req.payload[6])
			console.log('    => left pad blue:', req.payload[7])
			console.log('    => right pad red:', req.payload[9])
			console.log('    => right pad green:', req.payload[10])
			console.log('    => right pad blue:', req.payload[11])
		}
		if (req.cmd == this.CMD_TGLST) console.log('    => CMD_TGLST')
		if (req.cmd == this.CMD_READ) {
			console.log('    => CMD_READ')
			console.log('    => index:', req.payload[0])
			console.log('    => page:', req.payload[1])
		}
		if (req.cmd == this.CMD_WRITE) {
			console.log('    => CMD_WRITE')
			console.log('    => index:', req.payload[0])
			console.log('    => page:', req.payload[1])
			console.log('    => data', req.payload.slice(2))
		}
		if (req.cmd == this.CMD_MODEL) {
			console.log('    => CMD_MODEL - payload:', req.payload)
		}
		if (req.cmd == this.CMD_PWD) {
			console.log('    => CMD_PWD')
			console.log('    => index:', req.payload[0])
			console.log('    => authentication mode:', req.payload[1])
		}
		if (req.cmd == this.CMD_ACTIVE) {
			console.log('    => CMD_ACTIVE')
			console.log('    => active:', req.payload[0])
		}
		if (req.cmd == this.CMD_LEDSQ) console.log('    => CMD_LEDSQ')
		// stop verbose logging
		*/

		var res = new Response()
		res.cid = req.cid
		res.payload = new Buffer(0)
		res.payload.fill(0)
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
		for (var i = 1; i < 6; i++)
			uid[i] = Math.round(Math.random() * 256) % 256
		return uid.toString('hex').toUpperCase()
	}

	registerDefaults() {
		this._hook(this.CMD_WAKE, (req, res) => {
			//console.log('REQUEST (CMD_WAKE)')
			res.payload = new Buffer('286329204c45474f2032303134', 'hex')
			this._tokens.forEach(ev => this.tagPlaceEvent(ev))
		})

		this._hook(this.CMD_READ, (req, res) => {
			var ind = req.payload[0]
			var page = req.payload[1]
			//console.log('REQUEST (CMD_READ): index:', ind, 'page', page)
			res.payload = new Buffer(17)
			res.payload.fill(0)
			res.payload[0] = 0
			var start = page * 4
			var token = this._tokens.find(t => t.index == ind)
			//console.log(token)
			if (token)
				token.token.copy(res.payload, 1, start, start + 16)

		})

		this._hook(this.CMD_WRITE, (req, res) => {
			var ind = req.payload[0]
			var page = req.payload[1]
			res.payload = new Buffer('00', 'hex')
			var token = this._tokens.find(t => t.index == ind)
			if (token)
				req.payload.copy(token.token, 4 * page, 2, 6)
		})

		this._hook(this.CMD_MODEL, (req, res) => {
			console.log('    => encrypted payload:', req.payload)
			req.payload = this.decrypt(req.payload)
			console.log('    => decrypted payload:', req.payload)
			var index = req.payload.readUInt8(0)
			console.log('    => index:', index)
			var conf = req.payload.readUInt32BE(4)
			console.log('    => conf:', conf)
			var token = this._tokens.find(t => t.index == index)
			var buf = new Buffer(8)
			buf.writeUInt32BE(conf, 4)
			res.payload = new Buffer(9)
			res.payload.fill(0)
			if (token)
				if (token.token.id) {
					console.log('    => (OK) token found with id:', token.token.id)
					buf.writeUInt32LE(token.token.id || 0, 0)
				}
				else
					res.payload[0] = 0xF9
			else
				res.payload[0] = 0xF2
			console.log('    => D4 RESPONSE - state:', res.payload[0])
			console.log('    => D4 RESPONSE - unencrypted:', buf)
			this.encrypt(buf).copy(res.payload, 1)
			console.log('    => D4 RESPONSE - encrypted:', res.payload.slice(1, 9))
		})

		this._hook(this.CMD_SEED, (req, res) => {
			req.payload = this.decrypt(req.payload)
			var seed = req.payload.readUInt32LE(0)
			var conf = req.payload.readUInt32BE(4)
			this.burtle.init(seed)
			console.log('    => seed:', seed)
			console.log('    => conf:', conf)
			res.payload = new Buffer(8)
			res.payload.fill(0)
			res.payload.writeUInt32BE(conf, 0)
			res.payload = this.encrypt(res.payload)
		})

		this._hook(this.CMD_CHAL, (req, res) => {
			req.payload = this.decrypt(req.payload)
			var conf = req.payload.readUInt32BE(0)
			console.log('    => conf:', conf)
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

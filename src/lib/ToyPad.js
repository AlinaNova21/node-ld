import * as util from 'util'
import constants from './constants'
import EventEmitter from 'events'
import Event from './Event'
import Request from './Request'
import Response from './Response'
import Burtle from './Burtle'

var transports = {
	get HIDTransport() {
		return require('../transports/hid')
	},
	get LibUSBTransport() {
		return require('../transports/libusb')
	},
	get ChromeHIDTransport() {
		return require('../transports/chromehid')
	}
}

export default class ToyPad extends EventEmitter {
	constructor(opts) {
		opts = opts || {}
		super(opts)
		if (!opts.transport && opts.transport !== false) {
			if (process.browser)
				opts.transport = new transports.ChromeHIDTransport()
			else if (process.platform == 'linux')
				opts.transport = new transports.LibUSBTransport()
			else
				opts.transport = new transports.HIDTransport()
		}
		if (opts.transport) this.setTransport(opts.transport)
		constants.attach(this)
		this.callbacks = {}
		this.lastid = 0x00
		this.burtle = new Burtle()
		this.burtle.init(0)

		this.errInvalid = opts.errInvalid || true

		this.on('response', this.processCallback.bind(this))
	}

	getID() {
		return ++this.lastid % 256
	}

	_write(data) {
		// console.log('_write',data)
		if (this.transport)
			this.transport.write(data)
		else
			throw new Error('Transport not set')
	}

	setTransport(transport) {
		this.transport = transport
		this.transport.on('data', data => {
			this.emit('raw', data)
			if (data[0] == 0x55)
				this.emit('response', new Response(data))
			if (data[0] == 0x56)
				this.emit('event', new Event(data))
		})
		this.transport.on('ready', () => this.emit('ready'))
	}

	rand() {
		return this.burtle.rand()
	}

	request(cmd, payload, cb) {
		var req = new Request()
		req.cmd = cmd
		req.cid = this.getID()
		req.payload = payload
		this.registerCallback(req, cb)
		this.emit('request', req)
		this._write(req.build())
	}

	registerCallback(req, cb) {
		var cid = req.cid || req;
		this.callbacks[cid] = cb || (() => { })
		if (this.callbackDebug) console.log('callback registered', cid)
	}

	processCallback(resp) {
		var cid = resp.cid
		var cb = this.callbacks[cid]
		var err = null
		if (cb) {
			delete this.callbacks[cid]
			if (this.errInvalid && (resp.payload[0] & 0xF))
				err = new Error('Invalid 0x' + resp.payload[0].toString(16))
			cb(err, resp)
			if (this.callbackDebug) console.log('callback processed', cid)
		}
	}

	wake(cb) {
		this.request(this.CMD_WAKE, new Buffer('(c) LEGO 2014'), cb)
	}

	seed(seed, cb) {
		this.burtle.init(seed)
		var b = new Buffer(8)
		b.fill(0)
		b.writeUInt32BE(seed, 0)
		this.request(this.CMD_SEED, b, cb)
	}

	chal(data, cb) {
		var b = new Buffer(8)
		b.fill(0)
		this.request(this.CMD_CHAL, b, cb)
	}

	color(p, rgb, cb) {
		rgb = hextorgb(rgb)
		this.request(this.CMD_COL, new Buffer([p, rgb.r, rgb.g, rgb.b]), cb)
	}

	colorAll(rgb1, rgb2, rgb3, cb) {
		rgb1 = hextorgb(rgb1)
		rgb2 = hextorgb(rgb2)
		rgb3 = hextorgb(rgb3)
		this.request(this.CMD_COLAL, new Buffer([1, rgb1.r, rgb1.g, rgb1.b, 2, rgb2.r, rgb2.g, rgb2.b, 3, rgb3.r, rgb3.g, rgb3.b]), cb)
	}

	getPadColor(pad, cb) {
		// Subtract 1 here to match the Pad values used in color (1,2,3)
		this.request(this.CMD_GETCOL, new Buffer([pad - 1]), cb)
	}

	fade(p, s, c, rgb, cb) {
		rgb = hextorgb(rgb)
		this.request(this.CMD_FADE, new Buffer([p, s, c, rgb.r, rgb.g, rgb.b]), cb)
	}

	fadeRandom(p, s, c, cb) {
		this.request(this.CMD_FADRD, new Buffer([p, s, c]), cb)
	}

	fadeAll(s1, c1, rgb1, s2, c2, rgb2, s3, c3, rgb3, cb) {
		rgb1 = hextorgb(rgb1)
		rgb2 = hextorgb(rgb2)
		rgb3 = hextorgb(rgb3)
		this.request(this.CMD_FADAL, new Buffer([1, s1, c1, rgb1.r, rgb1.g, rgb1.b, 1, s2, c2, rgb2.r, rgb2.g, rgb2.b, 1, s3, c3, rgb3.r, rgb3.g, rgb3.b]), cb)
	}

	// onoff how long it stays off and on, [5,10] would mean it stays off-color 5 ticks, previous color 10 ticks.
	flash(pad, onoff, count, offRGB, cb) {
		offRGB = hextorgb(offRGB)
		this.request(this.CMD_FLASH, new Buffer([pad, onoff[0], onoff[1], count, offRGB.r, offRGB.g, offRGB.b]), cb)
	}

	flashAll(onoff1, a1, rgb1, onoff2, a2, rgb2, onoff3, a3, rgb3, cb) {
		rgb1 = hextorgb(rgb1)
		rgb2 = hextorgb(rgb2)
		rgb3 = hextorgb(rgb3)
		this.request(this.CMD_FLSAL, new Buffer([1, onoff1[0], onoff1[1], a1, rgb1.r, rgb1.g, rgb1.b, 1, onoff2[0], onoff2[1], a2, rgb2.r, rgb2.g, rgb2.b, 1, onoff3[0], onoff3[1], a3, rgb3.r, rgb3.g, rgb3.b]), cb)
	}

	tagList(cb) {
		this.request(this.CMD_TGLST, new Buffer([]), cb)
	}

	read(index, page, cb) {
		this.request(this.CMD_READ, new Buffer([index, page]), cb)
	}

	write(index, page, data, cb) {
		var buf = new Buffer(6)
		buf[0] = index
		buf[1] = page
		data.copy(buf, 2)
		this.request(this.CMD_WRITE, buf, cb)
	}

	model(data, cb) {
		this.request(this.CMD_MODEL, data, cb)
	}

	// The Lego pad automatically sends a PWD based on UID of the tag.
	// This CMD appears to configure this feature, valid types are:
	// 0 - Disable PWD Send, 1 - Enable default PWD algorithm, 2 - Custom PWD sent as 4 bytes
	// The index argument appears to not function properly (it will error if there is no tag on given index), but some indexes are always valid such as 84, if anyone knows why...
	// The effect is global until another PWD change
	pwd(type, pwd, cb) {
		var buf = new Buffer(6)
		if (type < 2)
			buf.fill(0)
		else
			pwd.copy(buf, 2)
		buf[0] = 84 //Possible tag index?
		buf[1] = type
		this.request(this.CMD_PWD, buf, cb)
	}

	// This appears to halt NFC operations until another read/write/pause is called.
	// State values: true, false
	active(state, cb) {
		if (state)
			this.request(this.CMD_ACTIVE, new Buffer([1]), cb)
		else
			this.request(this.CMD_ACTIVE, new Buffer([0]), cb)
	}
}
function hextorgb(hex) {
	hex = hex.replace(/#/, '')
	var ret = [parseInt('0x' + hex.slice(0, 2))
		, parseInt('0x' + hex.slice(2, 4))
		, parseInt('0x' + hex.slice(4, 6))
	]
	ret.r = ret[0]; ret.g = ret[1]; ret.b = ret[2]
	return ret
}

var fs = require('fs')
var ld = require('../')
var Frame = ld.Frame
var Request = ld.Request
var Response = ld.Response
var Event = ld.Event

var log = fs.createWriteStream('dumps/proto-'+(new Date()).toISOString()+'.hex')

var wiiu = new ld.transports.RawTransport('/dev/hidg0')
var usb = new ld.transports.RawTransport('/dev/hidraw0')
//var usb = new ld.transports.LibUSBTransport()

var pad = usb

wiiu.on('data',function(data){
	console.log('WU',data.toString('hex'))
	log.write('WU '+data.toString('hex')+"\n")
	hookSerToUSB(data,function(b){
		if(b){
			// console.log('CC',b.toString('hex'),b.toString('hex') == data.toString('hex'))
			usb.write(b)
		}
	})
})

usb.on('data',function(data){
	console.log('UW',data.toString('hex'))
	log.write('UW '+data.toString('hex')+"\n")
	hookUSBToSer(data,function(b){
		if(b){
			// console.log('CC',b.toString('hex'),b.toString('hex') == data.toString('hex'))
			wiiu.write(b)
		}
	})
})

var batmobile = new Buffer([
	0x04,0x0d,0xc5,0x44,0xba,0x6d,0x40,0x81,0x16,0x48,0x1f,0x00,0xe1,0x10,0x12,0x00,
	0x01,0x03,0xa0,0x0c,0x34,0x03,0x13,0xd1,0x01,0x0f,0x54,0x02,0x65,0x6e,0x39,0x34,
	0x35,0x37,0x35,0x32,0x30,0x52,0x31,0x36,0x31,0x35,0xfe,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x39,0x34,0x35,0x37,0x35,0x32,0x30,0x52,
	0x31,0x36,0x31,0x35,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xb1,0xb1,0xe4,0x41,
	0xf0,0x03,0x00,0x00,0xcf,0x00,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,
	0x60,0x08,0x3f,0xbd,0x04,0x00,0x00,0x1e,0xc0,0x05,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x04,0x0d,0xc5,0x44,0xba,0x6d,0x40,0x81
])

var callbacks = new (function(){
	var cbs = {}
	this.get = function(id){
		id = id.toString()
		var cb = cbs[id] || function(){}
		delete cbs[id]
		return cb;
	}
	this.set = function(id,cb){
		id = id.toString()
		cbs[id] = cb;
	}
})()

var cid = 0

function hookSerToUSB(data,cb){
	var req = new Request(data)
	// if(req.cmd == Request.CMD_READ && req.payload[0] == 0x01)
	// {
	// 	var addr = req.payload[1]*4
	// 	var r = new Response()
	// 	r.cid = req.cid
	// 	r.payload = new Buffer(17)
	// 	r.payload.fill(0)
	// 	batmobile.writeUInt16LE(cid,144)
	// 	batmobile.copy(r.payload,1,addr,addr+16)
	// 	data = r.build()
	// 	console.log('XS',data.toString('hex'))
	// 	wiiu.write(data)
	// 	data = null
	// }
	return cb(data);
}

function hookUSBToSer(data,cb){
	if(data[0] == 0x55)
	{
		var res = new Response(data)
		// var c = callbacks.get(res.cid)
		// if(c){
		// 	c(res)
		// 	data = null
		// }
	}else if(data[0] == 0x56)
	{
		var evt = new Event(data)
		// data = evt.build()
		// if(evt.payload[0] == 3 && evt.payload[3] == 0)
		// {
		// 	uid1 = evt.payload.slice(4)
		// 	cid++
		// 	var b = new Buffer(2)
		// 	b.writeUInt16LE(cid,0)
		// 	console.log('CID',cid,b.toString('hex'))
		// }
	}
	return cb(data);
}

function updateToken(pad,index,dir,uid)
{
	var e = new Event()
	e.payload = new Buffer([pad,0x00,index,dir,uid[0],uid[1],uid[2],uid[3],uid[4],uid[5],uid[6]])
	var data = e.build()
	console.log('XS',data.toString('hex'))
	wiiu.write(data)
}

var tick = 0
var uid1 = Buffer.concat([batmobile.slice(0,3),batmobile.slice(4,8)])
var uid2 = new Buffer([0x04,0x7D,0x37,0xEB,0x40,0x80])

process.stdin.on('data',function(data){
	updateToken(3,1,1,uid1)
	setTimeout(function(){
		cid++
		var b = new Buffer(2)
		b.writeUInt16LE(cid,0)
		console.log('CID',cid,b.toString('hex'))
		updateToken(3,1,0,uid1) 
	},100)
})

// setInterval(function(){
// 	updateToken(3,cid%2?6:7,1,cid%2?uid1:uid2)
// 	cid++
// 	updateToken(3,cid%2?6:7,0,cid%2?uid1:uid2)
// },8000)

// setTimeout(function(){
// 	setInterval(function(){
// 		updateToken(3,6,1,uid1)
// 		updateToken(3,6,0,uid1)
// 	},8000)
// },4000)

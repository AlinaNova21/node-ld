var fs = require('fs')
var ld = require('../')
var Frame = ld.common.Frame
var Request = ld.common.Request
var Response = ld.common.Response
var Event = ld.common.Event

// var usb = new ld.transports.LibUSBTransport()
var usb = new ld.transports.RawTransport('/dev/hidraw0')
var callbacks = new (function(){
	var cbs = this.cbs = {}
	this.get = function(id){
		id = id.toString()
		var cb = cbs[id] || null
		delete cbs[id]
		return cb;
	}
	this.set = function(id,cb){
		id = id.toString()
		cbs[id] = cb;
	}
})()

function init(){
	var r = new Request()
	r.cmd = Request.CMD_ACTIVATE
	r.cid = id()
	r.payload = new Buffer('(c) LEGO 2014')
	write(r.build())
	setColor(0,0xFF,0xFF,0xFF)
}
init()

usb.on('data',function(data){
	read(data)
	if(data[0] == 0x55)
	{
		var res = new Response(data)
		var cb = callbacks.get(res.cid)
		if(cb) cb(res)
	}else if(data[0] == 0x56)
	{
		var evt = new Event(data)
		data = evt.build()
		var pad = evt.payload[0]
		var index = evt.payload[2]
		var dir = evt.payload[3]
		var uid = evt.payload.slice(4)
		if(dir == 00){
			console.log('Starting dump for',uid.toString('hex'))
			setColor(pad,0xFF,0x00,0x00)
			dumpTag(index,function(data){
				console.log('Finished dump for',uid.toString('hex'))
				setColor(pad,0x00,0xFF,0x00)
			})
		}
	}
})
function read(data){
	console.log('UX',data.toString('hex'))
	// console.log(callbacks.cbs)
}
function write(data){
	console.log('XU',data.toString('hex'))
	// console.log(callbacks.cbs)
	usb.write(data)
}

function setColor(pad,r,g,b){
	var req = new Request()
	req.cmd = Request.CMD_LIGHT
	req.cid = id()
	req.payload = new Buffer([pad,r,g,b])
	write(req.build())
}

var lastid = 0
function id(){
	return (lastid++ % 256)
}
function dumpTag(index,cb){
	cb = cb || function(){}
	var TAGSIZE = 180
	var PAGESPERREAD = 4
	var PAGESIZE = 4
	var PAGECNT = TAGSIZE/PAGESIZE
	
	var b = new Buffer(TAGSIZE)
	b.fill(0)
	var tasks = []
	
	for(var page=0;page<PAGECNT;page+=PAGESPERREAD)
		tasks.push([index,page])

	var worker = function(task,cb){
		var req = new Request()
		req.cmd = Request.CMD_READ
		req.cid = id()
		req.payload = new Buffer(task)
		write(req.build())
		// console.log('Requested page ',task[1],req.cid)
		callbacks.set(req.cid,function(res){
			// console.log('Received page ',task[1],req.cid,res.payload)
			res.payload.slice(1).copy(b,(task[0]*TAGSIZE)+(task[1]*PAGESPERREAD))
			cb()
		})
	}

	var async = require('async')
	async.eachLimit(tasks,5,worker,function(){
		var hex = b.toString('hex')
		var id = hex.slice(0,6) + hex.slice(8,16)
		fs.writeFile('dumps/'+id.toUpperCase()+'.bin',b)
		cb(null,b)
	})
}
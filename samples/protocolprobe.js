var _ = require('lodash')
var ld = require('../')
var Frame = ld.Frame
var Request = ld.Request
var Response = ld.Response
var Event = ld.Event

var usb = new ld.transports.LibUSBTransport()
function init(){
	var r = new Request()
	r.cmd = Request.CMD_ACTIVATE
	r.cid = id()
	r.payload = new Buffer('(c) LEGO 2014')
	write(r.build())

	
	return;
	r.payload = new Buffer(8)
	r.cmd = Request.CMD_AUTH1
	r.cid = id()
	r.payload.fill(0)
	write(r.build())	

	r.cid = id()
	r.payload.fill(1)
	write(r.build())

	r.cmd = Request.CMD_AUTH2
	r.cid = id()
	r.payload.fill(0)
	write(r.build())	

	r.cid = id()
	r.payload.fill(1)
	write(r.build())
}
init()

var responses = []
var started = false
usb.on('data',function(data){
	read(data)
	if(data[0] == 0x55)
	{
		var res = new Response(data)
		if(res.cid == 0 && !started)
		{
			started = true
			for(var i=0;i<256;i++)
			{
				setTimeout((function(i){ 
					return function(){
						var r = new Request()
						r.cmd = i;
						r.cid = i
						r.payload = new Buffer(10)
						r.payload.fill(0)
						write(r.build())	
					}
				})(i),1)
			}
			setTimeout(function(){
				responses.forEach(function(v){
					var str =  new Buffer([v.cid]).toString('hex') + ' ' + v.raw
					console.log(str)
				})
			},3000)
		}else{
			res.raw = data.toString('hex')
			responses.push(res)
		}
	}else if(data[0] == 0x56)
	{
		var evt = new Event(data)
	}
	console.log('UX',data.toString('hex'))
})
function read(data){
	// console.log('UX',data.toString('hex'))
}
function write(data){
	console.log('XU',data.toString('hex'))
	// console.log(callbacks.cbs)
	usb.write(data)
}

var lastid = 0
function id(){
	return (lastid++ % 256)
}

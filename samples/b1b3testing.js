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

usb.on('data',function(data){
	read(data)
	if(data[0] == 0x55)
	{
		var res = new Response(data)
		console.log('UX',res.payload.toString('hex'))
	}else if(data[0] == 0x56)
	{

	}
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

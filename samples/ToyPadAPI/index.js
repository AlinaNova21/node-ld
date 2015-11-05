var ld = require('../../')
var	async = require('async')
var TCPClientTransport = ld.transports.TCPClientTransport
var LibUSBTransport = ld.transports.LibUSBTransport
var RawTransport = ld.transports.RawTransport
var JSONRPC = ld.JSONRPC

var trans = new TCPClientTransport('localhost',9999)
// var trans = new LibUSBTransport()
// var trans = new RawTransport('/dev/lego0')

var tp = new ld.ToyPad({ transport: trans })

var log = (err,resp)=>console.log(resp)

// tp.request(0xC2,new Buffer(1,1,100),log)

tp.wake(()=>{
	tp.color(0,0xFF,0xFF,0xFF)
	// tp.color(0,0,0,0)
	// X tp.request(0xC1,new Buffer([0xFF,0xFF,0,0xFF,0xFF,0,0xFF,0xFF,0]),log)
	// tp.request(0xC2,new Buffer([0,10,10,0xFF,0xFF,0xFF]),log)
	// tp.request(0xC3,new Buffer([0,10,10,5,0xFF,0x00,0x00]),log)
	// tp.request(0xC4,new Buffer([0,10,50,10]),log)
	// X tp.request(0xC5,new Buffer([1,10,10,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]),log)
	// tp.fadeAll(10,5,0xFF,0x00,0x00, 	10,5,0x00,0xFF,0x00,	10,5,0x00,0x00,0xFF,log)
	// tp.request(0xC7,new Buffer([1,10,10,5,0xFF,0x00,0x00, 	1,10,10,5,0x00,0xFF,0x00,	1,10,10,5,0x00,0x00,0xFF]),log)
	// tp.flashAll(10,10,5,0xFF,0x00,0x00, 	10,10,5,0x00,0xFF,0x00,	10,10,5,0x00,0x00,0xFF)
	// tp.request(0xC8,new Buffer([1,0xFF,0x00,0x00, 	1,0x00,0xFF,0x00,	1,0x00,0x00,0xFF]),log)

	// tp.color(1,0xFF,0,0,0)
	// tp.flash(1,0xFF,0,0)
})

var express = require('express')
var app = new express()

app.use(express.static('app'))

function wraptp(cmd){
	return (req,res)=>tp[cmd]((err,resp)=>res.json(resp.payload.toString('hex')))
}
var rpc = new JSONRPC(tp)
app.post('/toypad',rpc.handleRequest.bind(rpc))

app.listen(process.env.PORT || 8080)

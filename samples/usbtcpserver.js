var ld = require('../')

var usb = new ld.transports.LibUSBTransport()
var tcpserv = new ld.transports.TCPServerTransport(9999)

usb.on('data',function(data){
	tcpserv.write(data)
})

tcpserv.on('data',function(data){
	usb.write(data)
})

// Very simple :)

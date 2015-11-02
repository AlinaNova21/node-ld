var ld = require('../')

var usb = new ld.transports.LibUSBTransport()
var tcpclient = new ld.transports.TCPClientTransport('adamsodroid.local',9998)

usb.on('data',function(data){
	tcpclient.write(data)
})

tcpclient.on('data',function(data){
	usb.write(data)
})

// Very simple :)
var ld = require('../')

var serial = new ld.transports.SerialTransport("/dev/ttyUSB0",57600)
var usb = new ld.transports.LibUSBTransport()

serial.on('data',function(data){
	console.log('SU',data.toString('hex'))
	usb.write(data)
})

usb.on('data',function(data){
	console.log('US',data.toString('hex'))
	serial.write(data)
})

// Very simple :)
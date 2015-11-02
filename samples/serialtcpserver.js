var ld = require('../')

var serial = new ld.transports.SerialTransport("/dev/ttyUSB0",57600)
var tcpserv = new ld.transports.TCPServerTransport(9999)

serial.on('data',function(data){
	tcpserv.write(data)
})

tcpserv.on('data',function(data){
	serial.write(data)
})

// Very simple :)

module.exports = {
	common: require('./lib/common'),
	constants: require('./lib/constants'),
	host: require('./lib/host'),
	slave: require('./lib/slave'),
	Frame: require('./lib/Frame'),
	Request: require('./lib/Request'),
	Response: require('./lib/Response'),
	Event: require('./lib/Event'),
	transports:{
		TCPServerTransport: require('./transports/tcp').TCPServerTransport,
		TCPClientTransport: require('./transports/tcp').TCPClientTransport,
		LibUSBTransport: require('./transports/libusb'),
		SerialTransport: require('./transports/serial'),
		RawTransport: require('./transports/raw'),
	}
}

module.exports = {
	common: require('./lib/common'),
	host: require('./lib/host'),
	slave: require('./lib/slave'),
	transports:{
		TCPServerTransport: require('./transports/tcp').TCPServerTransport,
		TCPClientTransport: require('./transports/tcp').TCPClientTransport,
		LibUSBTransport: require('./transports/libusb'),
		SerialTransport: require('./transports/serial'),
		RawTransport: require('./transports/raw'),
	}
}
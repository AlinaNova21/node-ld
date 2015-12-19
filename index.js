
module.exports = {
	common: require('./lib/common'),
	JSONRPC: require('./lib/JSONRPC'),
	constants: require('./lib/constants'),
	Frame: require('./lib/Frame'),
	Request: require('./lib/Request'),
	Response: require('./lib/Response'),
	Event: require('./lib/Event'),
	ToyPad: require('./lib/ToyPad'),
	ToyPadEmu: require('./lib/ToyPadEmu'),
	Tag: require('./lib/Tag'),
	transports:{
		get TCPServerTransport() {
			return require('./transports/tcp').TCPServerTransport
		},
		get TCPClientTransport() {
			return require('./transports/tcp').TCPClientTransport
		},
		get LibUSBTransport() {
			return require('./transports/libusb')
		},
		get SerialTransport() {
			return require('./transports/serial')
		},
		get RawTransport() {
			return require('./transports/raw')
		},
		get DummyTransport() {
			return require('./transports/dummy')
		},
		get ChromeHID() {
			return require('./transports/chromehid')
		},
	}
}

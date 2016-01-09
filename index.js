
module.exports = {
	// getters are used to lazy load libraries
	get JSONRPC(){ 	
		return require('./lib/JSONRPC')
	},
	get constants(){ 	
		return require('./lib/constants')
	},
	get Frame(){ 	
		return require('./lib/Frame')
	},
	get Request(){ 	
		return require('./lib/Request')
	},
	get Response(){ 	
		return require('./lib/Response')
	},
	get Event(){ 	
		return require('./lib/Event')
	},
	get ToyPad(){ 	
		return require('./lib/ToyPad')
	},
	get ToyPadEmu(){ 	
		return require('./lib/ToyPadEmu')
	},
	get Tag(){ 	
		return require('./lib/Tag')
	},
	get TEA(){ 	
		return require('./lib/TEA')
	},
	get Burtle(){ 	
		return require('./lib/Burtle')
	},
	get PWDGen(){ 	
		return require('./lib/PWDGen')
	},
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
		get HID() {
			return require('./transports/hid')
		},

	}
}

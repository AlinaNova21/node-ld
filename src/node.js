import JSONRPC from './lib/JSONRPC'
import constants from './lib/constants'
import Frame from './lib/Frame'
import Request from './lib/Request'
import Response from './lib/Response'
import Event from './lib/Event'
import ToyPad from './lib/ToyPad'
import ToyPadEmu from './lib/ToyPadEmu'
import Tag from './lib/Tag'
import TEA from './lib/TEA'
import Burtle from './lib/Burtle'
import PWDGen from './lib/PWDGen'
import CharCrypto from './lib/CharCrypto'

export { JSONRPC, constants, Frame, Request, Response, Event, ToyPad, ToyPadEmu, Tag, TEA, Burtle, PWDGen, CharCrypto }

export var transports = {
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
	}
}

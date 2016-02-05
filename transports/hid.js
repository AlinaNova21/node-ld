var util = require('util')
var EventEmitter = require('events').EventEmitter
util.inherits(HIDTransport, EventEmitter)

var isWin = process.platform === 'win32'
var HID = require('node-hid')
var vid = 0x0E6F
var pid = 0x0241

function HIDTransport() {
  var self = this
  var dev = self.dev = new HID.HID(vid, pid)

  self.dev.on('data', function receiveData(chunk) {
		self.emit('data', chunk)
  })

  self.dev.on('error', function receiveError(error) {
    console.error("HID Error", error)
  })

  self.dev.resume()
  setTimeout(()=>this.emit('ready'),150)
  //self.write([0x55, 0x0f, 0xb0, 0x01, 0x28, 0x63, 0x29, 0x20, 0x4c, 0x45, 0x47, 0x4f, 0x20, 0x32, 0x30, 0x31, 0x34, 0xf7])
}

HIDTransport.prototype.close = function closeDevice(){
  var self = this
  if (self.dev) {
    self.dev.close()
  }
}

HIDTransport.prototype.write = function writeData(buffer){
  var self = this

	function toArrayBuffer(buffer) {
			var ab = new Array(buffer.length);
			for (var i = 0; i < buffer.length; ++i) {
					ab[i] = buffer[i];
			}
			return ab;
	}

  //Transform to regular array
  if (buffer instanceof Buffer) {
		buffer = toArrayBuffer(buffer)
  }

  buffer = [0].concat(buffer)

  if (self.dev) {
	  self.dev.write(buffer)
  }
}

module.exports = HIDTransport

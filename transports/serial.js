var SerialPort = require("serialport").SerialPort
var util = require('util')
var EventEmitter = require('events').EventEmitter;
util.inherits(SerialTransport, EventEmitter);

function SerialTransport(device,baud){
	var self = this
	self.serialport = new SerialPort(device, {
		baudrate: baud,
		parser: require("serialport").parsers.byteLength(32)
	});
	self.serialport.on('data',self.emit.bind(self,'data'))
	self.serialport.open(function(){
		self.active = true
	})
}

SerialTransport.prototype.write = function(data){
	if(this.active)
		this.serialport.write(data)
}

module.exports = SerialTransport
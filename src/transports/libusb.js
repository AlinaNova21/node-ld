var usb = require('usb')
var util = require('util')
var EventEmitter = require('events').EventEmitter;
util.inherits(LibUSBTransport, EventEmitter);

var isWin = process.platform === 'win32'

function LibUSBTransport(){
	var self = this
	var dev = self.dev = usb.findByIds(0x0e6f,0x0241);
	if(!dev) 
		throw new Error('Device Not Found')

	dev.open()
	var inter = dev.interface(0x00)
	if(!isWin && inter.isKernelDriverActive())
		inter.detachKernelDriver()
	inter.claim()
	var devin 	= self.devin	= inter.endpoint(0x81)
	var devout 	= self.devout	= inter.endpoint(0x01)

	devin.startPoll()

	devin.on('data',function(data){
		self.emit('data',data)
	})

	devin.on('end',function(){
		self.emit('end')
	})
  	setTimeout(()=>this.emit('ready'),150)
}

LibUSBTransport.prototype.write = function(buffer){
	this.devout.transfer(buffer,function(err){
		if(err) console.error(err)
	})
}

module.exports = LibUSBTransport
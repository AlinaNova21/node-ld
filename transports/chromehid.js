var EventEmitter = require('event').EventEmitter
var util = require('util')
var debug = require('debug')('HID')
module.exports = HID

function HID(){
	this._poll = null;
	this.device = null;
	this.connection = null;

	chrome.hid.onDeviceAdded.addListener((device: chrome.hid.HidDeviceInfo) => {
		debug('Device Added', device)
		this._deviceAdded(device)	
	})

	chrome.hid.onDeviceRemoved.addListener((deviceId: number) => {
		console.debug('Device Removed', deviceId)
	})

	chrome.hid.getDevices({},(devices: chrome.hid.HidDeviceInfo[])=>{
		devices.forEach((device: chrome.hid.HidDeviceInfo)=>this._deviceAdded(device));
	})
}


HID.prototype._deviceAdded = function(device){
	if (device.productId == 577 && device.vendorId == 3695) {
		this.device = device;
		chrome.hid.connect(device.deviceId, (connection: chrome.hid.Connection) => {
			this.connection = connection;
			this.startPolling();
			device.type = 'LD'
			this.emit('portalConnected', device);
		})
	}
}

HID.prototype.startPolling = function(){
	this._poll = true;
	this.poll();
}

HID.prototype.poll = function{
	chrome.hid.receive(this.connection.connectionId, (reportId: number, data: ArrayBuffer) => {
		this.emit('data', data);
		if(this._poll)
			this.poll()
	});
}

HID.prototype.stopPolling = function(){
	this._poll = false;
}

HID.prototype.send = function(data, cb){
	cb = cb || function(){}
	var src: Uint8Array = new Uint8Array(data)
	var dst: Uint8Array = new Uint8Array(32)
	dst.set(src)
	chrome.hid.send(this.connection.connectionId, 0, dst.buffer, cb);
}


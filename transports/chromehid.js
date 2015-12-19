var debug = require('debug')('HID')
var util = require('util')
var EventEmitter = require('events').EventEmitter;
util.inherits(HID, EventEmitter);

function HID(){
	if(global.__chromehidtransport) return global.__chromehidtransport
	global.__chromehidtransport = this
	this._poll = null;
	this.device = null;
	this.connection = null;

	chrome.hid.onDeviceAdded.addListener((device) => {
		console.log('Device Added', device)
		this._deviceAdded(device)	
	})

	chrome.hid.onDeviceRemoved.addListener((deviceId) => {
		console.log('Device Removed', deviceId)
		this._deviceRemoved(deviceId)
	})

	chrome.hid.getDevices({},(devices)=>{
		devices.forEach((device)=>this._deviceAdded(device));
	})
}

HID.prototype.getDevices = function(cb){
	cb = cb || function(){}
	chrome.hid.getDevices({},cb)
}

HID.prototype._deviceAdded = function(device){
	if (device.productId == 577 && device.vendorId == 3695) {
		this.device = device;
		chrome.hid.connect(device.deviceId, (connection) => {
			this.connection = connection;
			this.startPolling();
			device.type = 'LD'
			this.emit('connected', device);
		})
	}
}

HID.prototype._deviceRemoved = function(deviceId){
	if(this.device.deviceId == deviceId)
	{
		this.stopPolling()
		this.connection = null
		this.emit('disconnected',this.device)
	}
}

HID.prototype.startPolling = function(){
	this._poll = true;
	this.poll();
}

HID.prototype.poll = function(){
	chrome.hid.receive(this.connection.connectionId, (reportId, data) => {
		this.emit('data', data);
		if(this._poll)
			this.poll()
	});
}

HID.prototype.stopPolling = function(){
	this._poll = false;
}

HID.prototype.write = function(data, cb){
	cb = cb || function(){}
	if(!this.connection) return cb()
	var src = new Uint8Array(data)
	var dst = new Uint8Array(32)
	dst.set(src)
	chrome.hid.send(this.connection.connectionId, 0, dst.buffer, cb);
}

HID.prototype.isConnected = function(){
	return !!this.connection
}
module.exports = HID
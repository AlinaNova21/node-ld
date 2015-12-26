var ld = require('../')

// Initialize the toypad. By default it tries loading the HID transport on Windows and Mac, and LibUSB on linux 
// (libusb-1.0 must be installed for both hid and libusb transports on linux)
var toypad = new ld.ToyPad()

// These are not nessesary but are usefull for debugging data and seeing the flow
toypad.on('request',r=>console.log('REQ',r))
toypad.on('response',r=>console.log('RES',r))
toypad.on('event',e=>console.log('EV ',e))

// Wake the toypad, it will not respond to commands at all unless woken
// All commands currently accept an optional callback in the form of function(err,Response)
// Response will probably swapped out for a per command return value in the future to simplify things. 
toypad.wake((e,d)=>console.log('WAKE RET',d.toString('hex')))

// First is pad (0 for all, 1 for top, 2 for left, 3 for right)
// Second is color in #RRGGBB HEX format
toypad.color(0,'#FFFFFF')

setTimeout(()=>{
	toypad.color(1,'#FF0000')
	toypad.color(2,'#00FF00')
	toypad.color(3,'#0000FF')
},1000)

setTimeout(()=>{
	// first parameter is speed
	// second is cycle count. Even count ends on old color, Odd count lands on new color
	// third is color in #RRGGBB HEX format
	toypad.fadeAll(25,1,'#000000',25,1,'#000000',25,1,'#000000')
},5000)

setTimeout(()=>{
	toypad.fadeAll(25,1,'#FF0000',25,1,'#00FF00',25,1,'#0000FF')
},6500)

setTimeout(()=>{
	toypad.fadeAll(25,1,'#00FF00',25,1,'#0000FF',25,1,'#FF0000')
},8000)

setTimeout(()=>{
	toypad.fadeAll(25,1,'#0000FF',25,1,'#FF0000',25,1,'#00FF00')
},9500)

setTimeout(()=>{
	toypad.fadeAll(25,1,'#FF0000',25,1,'#00FF00',25,1,'#0000FF')
},11000)

setTimeout(()=>{
	toypad.fadeAll(25,1,'#000000',25,1,'#000000',25,1,'#000000')
},12500)

setTimeout(()=>{
	toypad.fadeAll(25,10,'#00FF00',25,10,'#00FF00',25,10,'#00FF00')
},14000)
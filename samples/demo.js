var fs = require('fs')
var ld = require('../')
var Frame = ld.Frame
var Request = ld.Request
var Response = ld.Response
var Event = ld.Event
var transport = new ld.transports.HID()

//http://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
process.stdin.resume();//so the program will not close instantly

function exitHandler(options, err) {
		transport.close()
    if (options.cleanup) console.log('clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

var req = new Request()
req.cid = 0
req.cmd = Request.CMD_WAKE // 0xB0
req.payload = new Buffer('(c) LEGO 2014')
transport.write(req.build()) // req.build() returns a 32 byte buffer, checksums and length are automatically computed\

transport.on('data', function(data){
  if(data[0] == 0x55){
		var res = new Response(data)
		console.log('RES', res.payload.toString('hex'))
	} else if(data[0] == 0x56) {
		// Token place/remove event
		var ev = new Event(data)
    console.log(ev)
	}
})


var ld = require('../../')
var ToyPadEmu = ld.ToyPadEmu
var TCPServerTransport = ld.transports.TCPServerTransport

var srv = new TCPServerTransport(0)

var emu = new ToyPadEmu(srv)

emu.use(function(req,res){
	console.log(req.cmd.toString(16),req.payload.toString('hex'))
})

emu.use(emu.CMD_WAKE,function(req,res){
	res.payload = new Buffer('002F020102020402F500194353DC39B3AE4618C905FE802C','hex')
	if(req.payload.toString() != '(c) LEGO 2014')
		res.cancel()
})

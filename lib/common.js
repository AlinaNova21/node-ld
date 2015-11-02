var _ = require('lodash')

var constants = require('./constants')

function ToyPadCommon(){
	constants.attach(this)
	var callbacks = {}
	var lastid = 0x00

	this.init = function(cb){
		var req = new Request()
		req.cmd = this.CMD_ACTIVATE
		req.payload = new Buffer('(c) LEGO 2014')
		return req.build()
	}

	function id(){
		if(lastid == 0xFF)
			lastid = 0
		return ++lastid
	}
}

module.exports = ToyPadCommon
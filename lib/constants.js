function attachConstants(obj){
	obj.CMD_ACTIVATE = 0xB0
	obj.CMD_AUTH1 = 0xB1
	obj.CMD_AUTH2 = 0xB3
	obj.CMD_LIGHT = 0xC0
	obj.CMD_LIGHT_FADE_SINGLE = 0xC2
	obj.CMD_LIGHT_FADE_ALL = 0xC6
	obj.CMD_PRESENSE = 0xD0
	obj.CMD_READ = 0xD2
	obj.CMD_WRITE = 0xD3
	obj.CMD_FIRST_SEEN = 0xD4
}

module.exports = {
	attach: attachConstants,
}
attachConstants(module.exports)
function attachConstants(obj){
	obj.CMD_WAKE  = 0xB0
	obj.CMD_SEED  = 0xB1
	obj.CMD_CHAL  = 0xB3
	obj.CMD_COL   = 0xC0
	obj.CMD_FADE  = 0xC2
	obj.CMD_FADRD = 0xC4																									
	obj.CMD_FADAL = 0xC6
	obj.CMD_FLSAL = 0xC7
	obj.CMD_COLAL = 0xC8
	obj.CMD_TGLST = 0xD0
	obj.CMD_READ  = 0xD2
	obj.CMD_WRITE = 0xD3
	obj.CMD_MODEL = 0xD4
	obj.CMD_E1    = 0xE1
	obj.CMD_E5    = 0xE5
	obj.CMD_LEDSQ = 0xFF
}

module.exports = {
	attach: attachConstants,
}
attachConstants(module.exports)
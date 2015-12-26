var commands = {
	CMD_WAKE  : 0xB0,
	CMD_SEED  : 0xB1,
	CMD_CHAL  : 0xB3,
	CMD_COL   : 0xC0,
	CMD_FADE  : 0xC2,
	CMD_FADRD : 0xC4,
	CMD_FADAL : 0xC6,
	CMD_FLSAL : 0xC7,
	CMD_COLAL : 0xC8,
	CMD_TGLST : 0xD0,
	CMD_READ  : 0xD2,
	CMD_WRITE : 0xD3,
	CMD_MODEL : 0xD4,
	CMD_E1    : 0xE1,
	CMD_E5    : 0xE5,
	CMD_LEDSQ : 0xFF,
}
function attachConstants(obj){
	for(k in commands)
		Object.defineProperty(obj,k,{
			value: commands[k],
			enumerable: false
		})
}

module.exports = {
	attach: attachConstants,
}
attachConstants(module.exports)
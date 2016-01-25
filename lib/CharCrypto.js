"use strict";

var TEA = require('../').TEA
var rotr32 = (a,b)=>((a>>>b)|(a<<(32-b))) >>> 0
var debug = false
class CharCrypto {
	genkey(uid){
		var key = new Buffer(this.scramble(uid,3)+this.scramble(uid,4)+this.scramble(uid,5)+this.scramble(uid,6),'hex')
		return flipBytes(key)
	}
	encrypt(uid,charid){
		var tea = new TEA()
		tea.key = this.genkey(uid)
		var buf = new Buffer(8)
		buf.writeUInt32LE(charid,0)
		buf.writeUInt32LE(charid,4)
		return tea.encrypt(buf)
	}
	decrypt(uid,data){
		var tea = new TEA()
		tea.key = this.genkey(uid)
		var buf = tea.decrypt(data)
		return buf.readUInt32LE(0)
	}
	scramble(uid,cnt){
		var base = new Buffer([
			0xFF, 0xFF, 0xFF, 0xFF,
			0xFF, 0xFF, 0xFF, 0xb7,
			0xd5, 0xd7, 0xe6, 0xe7,
			0xba, 0x3c, 0xa8, 0xd8,
			0x75, 0x47, 0x68, 0xcf,
			0x23, 0xe9, 0xfe, 0xaa
		]);
		uid = new Buffer(uid,'hex')
	 	uid.copy(base)
		base[(cnt * 4) - 1] = 0xaa
		// base[30] = base[31] = 0xAA
	 	
	   	var v2 = 0;
	 	for (var i = 0; i < cnt; i++) {
			var v4 = rotr32(v2,25);
			var v5 = rotr32(v2,10);
			var b = base.readUInt32LE(i*4)
			v2 = (b + v4 + v5 - v2) >>> 0;
			if(debug) { console.log("[%d] %s %s %s %s", i, v4.toString(16), v5.toString(16), b.toString(16), v2.toString(16)); }
	 	}
	 
	 	var b = new Buffer(4)
	 	b.writeUInt32LE(v2)
	 	return b.toString('hex');
	}
}
function flipBytes(buf){
    var out = new Buffer(buf.length)
    for(var i = 0; i<buf.length; i+=4)
        out.writeUInt32BE(buf.readUInt32LE(i) >>> 0,i)
    return out
}

module.exports = CharCrypto

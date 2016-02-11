function flipBytes(buf){
    var out = new Buffer(buf.length)
    for(var i = 0; i<buf.length; i+=4)
        out.writeUInt32BE(buf.readUInt32LE(i) >>> 0,i)
    return out
}

export default class TEA {
    constructor(){
    	this.key = new Buffer([0x55,0xFE,0xF6,0xB0,0x62,0xBF,0x0B,0x41,0xC9,0xB3,0x7C,0xB4,0x97,0x3E,0x29,0x7B])
        this.key = flipBytes(this.key)
    }

    encrypt(buffer){
    	var buf = new Buffer(8)
    	var d1 = buffer.readInt32LE(0)
    	var d2 = buffer.readInt32LE(4)
    	var keya = [this.key.readUInt32BE(0),this.key.readUInt32BE(4),this.key.readUInt32BE(8),this.key.readUInt32BE(12)]
    	var data = this.encipher([d1,d2],keya)
    	buf.writeUInt32LE(data[0],0)
    	buf.writeUInt32LE(data[1],4)
    	// console.log('ENCRYPT',buffer.toString('hex'),buf.toString('hex'))
    	return buf
    }

    decrypt(buffer){
    	var buf = new Buffer(8)
    	var d1 = buffer.readUInt32LE(0)
    	var d2 = buffer.readUInt32LE(4)
    	buffer = flipBytes(buffer)
    	var keya = [this.key.readUInt32BE(0),this.key.readUInt32BE(4),this.key.readUInt32BE(8),this.key.readUInt32BE(12)]
    	var data = this.decipher([d1,d2],keya)
    	buf.writeUInt32LE(data[0],0)
    	buf.writeUInt32LE(data[1],4)
    	// console.log('DECRYPT',buffer.toString('hex'),buf.toString('hex'))
    	return buf
    }

    encipher(v,k){ // 64bit v, 128bit k
        var v0=v[0],
            v1=v[1],
            sum=0,
            delta=0x9E3779B9,
            k0=k[0],
            k1=k[1],
            k2=k[2],
            k3=k[3];

        for(var i=0;i<32;i++)
        {
            sum += delta;
            sum >>>= 0;
            v0 += (((v1<<4)+k0) ^ (v1+sum) ^ ((v1>>>5)+k1)) >>> 0;
            v1 += (((v0<<4)+k2) ^ (v0+sum) ^ ((v0>>>5)+k3)) >>> 0;
        }

        return [v0 >>> 0,v1 >>> 0];

    }

    decipher(v,k)
    {
        var v0=v[0],
            v1=v[1],
            sum=0xC6EF3720,
            delta=0x9E3779B9,
            k0=k[0],
            k1=k[1],
            k2=k[2],
            k3=k[3];
        for(var i=0;i<32;i++)
        {
            v1 -= (((v0<<4)+k2) ^ (v0+sum) ^ ((v0>>>5)+k3)) >>> 0
            v0 -= (((v1<<4)+k0) ^ (v1+sum) ^ ((v1>>>5)+k1)) >>> 0
            sum -= delta;
            sum >>>= 0;
        }
       
        return [v0 >>> 0,v1 >>> 0];
    }
}
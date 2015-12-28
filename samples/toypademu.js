var fs = require('fs')
var ld = require('../')
var Frame = ld.Frame
var Request = ld.Request
var Response = ld.Response
var Event = ld.Event
var Burtle = ld.Burtle
var tea = new TEA()
var prng = new Burtle()

var log = fs.createWriteStream('dumps/proto-'+(new Date()).toISOString()+'.hex')

var wiiu = new ld.transports.RawTransport('/dev/hidg0')

Request.prototype.decrypt = function(){ this.payload = tea.decrypt(this.payload) }
Response.prototype.encrypt = function(){ this.payload = tea.encrypt(this.payload) }

wiiu.on('data',function(data){
	console.log('REQ',data.toString('hex'))
	var req = new Request(data)
	var res = new Response()
	res.cid = req.cid
	var cmds = {
		Request.CMD_WAKE: WAKE
		Request.CMD_CHAL: CHAL
	}
	if(cmds[req.cmd])
		cmds[req.cmd](req,res)
	if(res.cancel) return
	console.log('RES',res.build().toString('hex'))
	wiiu.write(res.build())
})

function WAKE(req,res){
	res.payload = new Buffer(0)
}

function SEED(req,res){
	req.decrypt()
	var seed = req.payload.readUInt32BE(0)
	var conf = req.payload.readUInt32BE(4)
	prng.init(seed)
	res.payload = new Buffer(8)
	res.payload.fill(0)
	res.payload.writeUInt32BE(conf,0)
	res.encrypt()
}

function CHAL(req,res){
	req.decrypt()
	var conf = req.payload.readUInt32BE(0)
	res.payload = new Buffer(8)
	res.payload.writeUInt32BE(prng.rand(),0)
	res.payload.writeUInt32BE(conf,4)
	res.encrypt()
}

function TEA(){
	this.key = new Buffer([0x55,0xFE,0xF6,0x30,0x62,0xBF,0x0B,0xC1,0xC9,0xB3,0x7C,0x34,0x97,0x3E,0x29,0xFB])
	this.key = flipBytes(this.key)

	this.encrypt = function(buffer){
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

	this.decrypt = function(buffer){
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

    this.encipher = function(v,k){ // 64bit v, 128bit k
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
    this.decipher = function(v,k)
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
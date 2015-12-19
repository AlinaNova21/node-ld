var fs = require('fs')
var ld = require('../')
var Frame = ld.Frame
var Request = ld.Request
var Response = ld.Response
var Event = ld.Event
var Burtle = require('../lib/Burtle')
var tea = new TEA()
var prng = new Burtle()

// var log = fs.createWriteStream('dumps/proto-'+(new Date()).toISOString()+'.hex')

var wiiu = new ld.transports.RawTransport('/dev/hidg0')

Request.prototype.decrypt = function(){ this.payload = tea.decrypt(this.payload) }
Response.prototype.encrypt = function(){ this.payload = tea.encrypt(this.payload) }

wiiu.on('data',function(data){
	var req = new Request(data)
	console.log('REQ',data.toString('hex'))
	var res = new Response()
	res.cid = req.cid
	res.payload = new Buffer(0)
	var cmds = {}
	cmds[Request.CMD_WAKE] = WAKE
	cmds[Request.CMD_SEED] = SEED
	cmds[Request.CMD_CHAL] = CHAL
	cmds[Request.CMD_READ] = READ
	cmds[Request.CMD_MODEL] = MODEL
	if(req.cmd & 0xC0)
		res.payload = new Buffer([0])
	if(cmds[req.cmd])
		cmds[req.cmd](req,res)
	if(res.cancel) return
	
	console.log('RES',res.build().toString('hex'))
	wiiu.write(res.build())
})
var queue = []
setInterval(function(){
	if(!queue.length) return
	var ev = queue.shift()
	console.log('EV ',ev.build().toString('hex'))
	wiiu.write(ev.build())
},100)

var Gandalf = fs.readFileSync('./dumps/04A3BDFA544280.bin')
Gandalf.uid = '04A3BDFA544280'
var Batman = fs.readFileSync('./dumps/04686652A24081.bin')
Batman.uid = '04686652A24081'
var uid = new Buffer('04686652A24081','hex')
uid[4] = Math.round(Math.random() * 256) % 256
uid[5] = Math.round(Math.random() * 256) % 256
uid[6] = Math.round(Math.random() * 256) % 256
uid[7] = Math.round(Math.random() * 256) % 256
Batman.uid = uid.toString('hex').toUpperCase()
console.log(Batman.uid)
RemoveTag(1,0,Batman.uid)
PlaceTag(1,0,Batman.uid)
console.log('init')

function WAKE(req,res){
	res.payload = new Buffer('286329204c45474f2032303134','hex')
	PlaceTag(1,0,Batman.uid)
}

function READ(req,res){
	var ind = req.payload[0]
	var page = req.payload[1]
	res.payload = new Buffer(17)
	res.payload[0] = 0
	Batman.copy(res.payload,1,page * 4,(page * 4) + 16)
}

function MODEL(req,res){
	req.decrypt()
	console.log('D4',req.payload.toString('hex'))
	var buf = req.payload
	buf[0] = 0x05
	buf[1] = 0
	buf[2] = 0
	buf[3] = 0
	buf = tea.encrypt(buf)
	res.payload = new Buffer(9)
	res.payload[0] = 0
	buf.copy(res.payload,1)
	console.log('  ',tea.decrypt(buf).toString('hex'))
}

function SEED(req,res){
	req.decrypt()
	// console.log('B1',req.payload.toString('hex'))
	var seed = req.payload.readUInt32LE(0)
	var conf = req.payload.readUInt32BE(4)
	prng.init(seed)
	console.log('SEED',seed)
	res.payload = new Buffer(8)
	res.payload.fill(0)
	res.payload.writeUInt32BE(conf,0)
	// console.log('  ',res.payload.toString('hex'))
	res.encrypt()
}

function CHAL(req,res){
	req.decrypt()
	// console.log('B3',req.payload.toString('hex'))
	var conf = req.payload.readUInt32BE(0)
	res.payload = new Buffer(8)
	var rand = prng.rand()
	console.log('RNG',rand.toString(16))
	res.payload.writeUInt32LE(rand,0)
	res.payload.writeUInt32BE(conf,4)
	// console.log('  ',res.payload.toString('hex'))
	res.encrypt()
}

function LoadDump(file){
	return fs.readFileSync(file)
}

function PlaceTag(pad,index,uid){
	var ev = new Event()
	ev.pad = pad
	ev.index = index
	ev.uid = uid
	ev.dir = 0
	queue.push(ev)
}

function RemoveTag(pad,index,uid){
	var ev = new Event()
	ev.pad = pad
	ev.index = index
	ev.uid = uid
	ev.dir = 1
	queue.push(ev)
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

function flipBytes(buf){
	var out = new Buffer(buf.length)
	for(var i = 0; i<buf.length; i+=4)
		out.writeUInt32BE(buf.readUInt32LE(i) >>> 0,i)
	return out
}
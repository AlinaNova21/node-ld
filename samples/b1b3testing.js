var ld = require('../')
var Frame = ld.Frame
var Request = ld.Request
var Response = ld.Response
var Event = ld.Event
// var pad = new ld.transports.TCPClientTransport('nas.remote.ovh',9998)
var pad = new ld.transports.TCPClientTransport('192.168.2.190',9998)


var key = new Buffer([0x55,0xFE,0xF6,0x30,0x62,0xBF,0x0B,0xC1,0xC9,0xB3,0x7C,0x34,0x97,0x3E,0x29,0xFB])
key = flipBytes(key)
var nums = {a: [],b: [],a1: [],b1: []}
function init(){

	// B1 00000000 00000000
	// B3 92af7fd1 00000000
	// B3 0cf2f66f 00000000
	// B3 f58c2749 00000000
	// B3 bef8474c 00000000

	var b = new Burtle()
	b.init(0)
	console.log(flipUInt32(b.rand()).toString(16))
	console.log(flipUInt32(b.rand()).toString(16))
	console.log(flipUInt32(b.rand()).toString(16))
	console.log(flipUInt32(b.rand()).toString(16))
	process.exit()
	// var b = new Buffer(8)
	// b.fill(0)
	// var b = encrypt(b)
	// var b = decrypt(b)
	// encrypt(b)
	// b.fill(0)
	// b[7] = 1
	/*
	b1 99 a6 d6 c7 0e e5 2f 81
	   b4 79 80 ed c0 50 65 0c

	b3 26 e9 7b 28 0c 9f db 47
	   96 c6 06 70 50 23 f7 1a

	*/
	/** /
	var buffers = [
		['B1 REQ',new Buffer("99a6d6c70ee52f81","hex")],
		['B1 RES',new Buffer("b47980edc050650c","hex")],
		['B3 REQ',new Buffer("26e97b280c9fdb47","hex")],
		['B3 RES',new Buffer("96c606705023f71a","hex")],
	]

	var seed1 = 'c1733832'
	var seed2 = '74500dde'
	// flipBytes(buffers[0])
	var buf1 = decrypt(buffers[0][1])
	console.log(encrypt(new Buffer(16).fill(0)))
	seed1 = buf1.readUInt32BE(4) >>> 0
	seed('a',seed1)
	var buf2 = decrypt(buffers[1][1])
	seed2 = buf2.readUInt32BE(0) >>> 0
	seed('b',seed2)
	console.log(seed1.toString(16),seed2.toString(16))
	nums.a.push(seed1.toString(16))
	nums.b.push(seed2.toString(16))
	for(var i=0;i<100000;i++)
	{
		var a = prng('a').toString(16)
		var b = prng('b').toString(16)
		nums.a.push(a)
		nums.b.push(b)
	}
	seed('a',seed1)
	seed('b',seed2)

	buffers.forEach(function(buffer){
		var buf = decrypt(buffer[1])
		var a = buf.slice(0,4).toString('hex')
		var b = buf.slice(4,8).toString('hex')
		console.log(buffer[0],a,b,nums.a.indexOf(a),nums.b.indexOf(b),nums.a.indexOf(b),nums.b.indexOf(a))
	})
	/**/
	// process.exit()
	// return 
	var seed1 = 0
	var seed2 = 0
	seed('a',seed1)
	seed('b',seed2)
	seed('a_1',seed1)
	seed('b_1',seed2)
	nums.a.push(seed1.toString(16))
	nums.b.push(seed2.toString(16))
	for(var i=0;i<100000;i++)
	{
		nums.a.push(prng('a').toString(16))
		nums.b.push(flipUInt32(prng('b')).toString(16))
		nums.a1.push(prng('a1').toString(16))
		nums.b1.push(flipUInt32(prng('b1')).toString(16))
	}
	seed('a',seed1)
	seed('b',seed2)
	seed('a_1',seed1)
	seed('b_1',seed2)
	
	var r = new Request()
	r.cmd = Request.CMD_WAKE
	r.cid = id()
	r.payload = new Buffer('(c) LEGO 2014')
	write(r.build())

	r.payload = new Buffer(8)
	r.cmd = Request.CMD_SEED
	r.cid = id()
	r.payload.fill(0)
	r.payload.writeUInt32LE(seed1,0)
	r.payload = encrypt(r.payload)
	write(r.build())
	console.log('REQ','B1',r.payload.toString('hex'),decrypt(r.payload).toString('hex'))

	r.cmd = Request.CMD_CHAL
	r.cid = id()
	r.payload.fill(0)
	r.payload = encrypt(r.payload)
	write(r.build())
	console.log('REQ','B3',r.payload.toString('hex'))

	r.cmd = Request.CMD_CHAL
	r.cid = id()
	r.payload.fill(0)
	r.payload = encrypt(r.payload)
	write(r.build())
	console.log('REQ','B3',r.payload.toString('hex'))

	r.cmd = Request.CMD_CHAL
	r.cid = id()
	r.payload.fill(0)
	r.payload = encrypt(r.payload)
	write(r.build())
	console.log('REQ','B3',r.payload.toString('hex'))

	r.cmd = Request.CMD_CHAL
	r.cid = id()
	r.payload.fill(0)
	r.payload = encrypt(r.payload)
	write(r.build())
	console.log('REQ','B3',r.payload.toString('hex'))
}

pad.on('data',function(data){
	read(data)
	if(data[0] == 0x55)
	{
		var res = new Response(data)
		console.log('RES',res.payload.toString('hex'))
		if(!res.cid) return
		res.payload = decrypt(res.payload)
		var a = res.payload.slice(0,4).toString('hex')
		var b = res.payload.slice(4,8).toString('hex')
		var tsa = res.payload.readUInt32BE(0)
		// seed('ta',tsa)
		console.log(a,b)
		// for(var i=0;i<10;i++)
			// console.log(prng('ta').toString(16),prng('ta').toString(16))
		var ind = []
		var i;
		for(var k in nums)
		{
			i = nums[k].indexOf(a)
			if(i>-1) ind.push([k,'a',i])
			i = nums[k].indexOf(b)
			if(i>-1) ind.push([k,'b',i])
		}
		console.log(ind)
	}else if(data[0] == 0x56)
	{

	}
})

function read(data){
	// console.log('UX',data.toString('hex'))
}

function write(data){
	// console.log('REQ',data.toString('hex'))
	// console.log(callbacks.cbs)
	pad.write(data)
}

var lastid = 0
function id(){
	return (lastid++ % 256)
}

var prngglobal = {}
function seed(key,value){
	key = key || 'default'
	prngglobal[key] = value
}

function prng(key){
	key = key || 'default'
	prngglobal[key] = prngglobal[key] || 0
	prngglobal[key] = (((prngglobal[key] * 0x19660D) >>> 0) + 0x3C6EF35F) >>> 0
    return prngglobal[key]
}
function prng1(key){
	key = key || 'default'
	key += '_1'
	prngglobal[key] = prngglobal[key] || 0
	prngglobal[key] = flipUInt32(prngglobal[key])
    prngglobal[key] = (((prngglobal[key] * 0x19660D) >>> 0) + 0x3C6EF35F) >>> 0
    prngglobal[key] = flipUInt32(prngglobal[key])
    return prngglobal[key]
}

function flipBytes(buf){
	var out = new Buffer(buf.length)
	for(var i = 0; i<buf.length; i+=4)
		out.writeUInt32BE(buf.readUInt32LE(i) >>> 0,i)
	return out
}

function flipUInt32(num){
	var buf = new Buffer(4)
	buf.writeUInt32LE(num,0)
	return buf.readUInt32BE(0) >>> 0
}

function encrypt(buffer){
	var buf = new Buffer(8)
	var d1 = buffer.readInt32LE(0)
	var d2 = buffer.readInt32LE(4)
	var keya = [key.readUInt32BE(0),key.readUInt32BE(4),key.readUInt32BE(8),key.readUInt32BE(12)]
	var data = TEA.encipher([d1,d2],keya)
	buf.writeUInt32LE(data[0],0)
	buf.writeUInt32LE(data[1],4)
	// console.log('ENCRYPT',buffer.toString('hex'),buf.toString('hex'))
	return buf
}

function decrypt(buffer){
	var buf = new Buffer(8)
	var d1 = buffer.readUInt32LE(0)
	var d2 = buffer.readUInt32LE(4)
	buffer = flipBytes(buffer)
	var keya = [key.readUInt32BE(0),key.readUInt32BE(4),key.readUInt32BE(8),key.readUInt32BE(12)]
	var data = TEA.decipher([d1,d2],keya)
	buf.writeUInt32LE(data[0],0)
	buf.writeUInt32LE(data[1],4)
	// console.log('DECRYPT',buffer.toString('hex'),buf.toString('hex'))
	return buf
}

var TEA = {
    encipher: function(v,k){ // 64bit v, 128bit k
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
    },
    decipher: function(v,k)
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

function ToUint32(x) {
    return x >>> 0;
}


function Burtle(seed){
	this.x = { a:0, b:0, c:0, d:0 };
}
Burtle.prototype.init = function(seed) {
    var i;
    x = this.x
    x.a = 0xf1ea5eed;
    x.b = x.c = x.d = seed;
    for (i=0; i<42; ++i)
        this.rand(x);
}

Burtle.prototype.rand = function() {
	var x = this.x
	var rot = (a,b)=>((a<<b)|(a>>>(32-b))) >>> 0
    var e = x.a - rot(x.b, 21) >>> 0;
    x.a = (x.b ^ rot(x.c, 19)) >>> 0;
    x.b = (x.c + rot(x.d, 6)) >>> 0;
    x.c = (x.d + e) >>> 0;
    x.d = (e + x.a) >>> 0;
    return x.d
}

Burtle.prototype.buf = function(){
	var x = this.x
    var buf = new Buffer(16)
    buf.writeUInt32LE(x.a,0,true)
    buf.writeUInt32LE(x.b,4,true)
    buf.writeUInt32LE(x.c,8,true)
    buf.writeUInt32LE(x.d,12,true)
    console.log(buf,x)
    return buf.toString('hex')
}

init()

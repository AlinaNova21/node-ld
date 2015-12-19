var ld = require('../')
var Frame = ld.Frame
var Request = ld.Request
var Response = ld.Response
var Event = ld.Event

// var pad = new ld.transports.TCPClientTransport('nas.remote.ovh',9998)
// var pad = new ld.transports.TCPClientTransport('192.168.2.190',9998)
var pad = new ld.transports.RawTransport('/dev/hidraw0')
// var pad = new ld.transports.LibUSBTransport()


var key = new Buffer([0x55,0xFE,0xF6,0x30,0x62,0xBF,0x0B,0xC1,0xC9,0xB3,0x7C,0x34,0x97,0x3E,0x29,0xFB])
key = flipBytes(key)

function init(){
	var Burtle = require('../lib/Burtle')
	var b = new Burtle()
	
	var b1 = new Buffer('14421f35b3dbc722','hex')
	b1 = decrypt(b1)
	b.init(b1.readUInt32LE(0))

	console.log(b.rand().toString(16))
	// WU 550ab3054f06d1707e382a3ac700000000000000000000000000000000000000
	var b3r = new Buffer('29882b180f21b6bb','hex')
	b3r = decrypt(b3r)
	console.log(b3r.readUInt32LE(0).toString(16))
	
	console.log('D4',decrypt(new Buffer('6b3ecd1026112d3e','hex')).toString('hex'))
	console.log('D4',decrypt(new Buffer('43d373a7ac47ec4e','hex')).toString('hex'))
	process.exit()

	// setTimeout(function(){
	// 	pad.client.disconnect()
	// 	process.exit()
	// },5000)
	var r = new Request()
	r.cmd = Request.CMD_WAKE
	r.cid = id()
	r.payload = new Buffer('(c) LEGO 2014')
	console.log('REQ','WAKE')
	write(r.build())

	r.cmd = Request.CMD_SEED
	r.cid = id()
	r.payload = new Buffer([0,0,0,0,0,0,0,0])
	r.payload = encrypt(r.payload)
	console.log('REQ','SEED')
	write(r.build())	

	r.cmd = Request.CMD_CHAL
	r.cid = id()
	r.payload = new Buffer([0,0,0,0,0,0,0,0])
	r.payload = encrypt(r.payload)
	console.log('REQ','CHAL')
	write(r.build())	


	// r.payload = new Buffer(8)
	// r.cmd = 0xD4
	// r.cid = id()
	// r.payload.fill(0xA)
	// r.payload[0] = 0
	// r.payload = encrypt(r.payload)
	// write(r.build())

	// r.payload = new Buffer(8)
	// r.cmd = 0xD4
	// r.cid = id()
	// r.payload.fill(0)
	// r.payload[0] = 1
	// r.payload = encrypt(r.payload)
	// write(r.build())
	// console.log('REQ','D4',r.payload.toString('hex'),decrypt(r.payload).toString('hex'))

	// r.payload = new Buffer(8)
	// r.cmd = 0xD4
	// r.cid = id()
	// r.payload.fill(0)
	// r.payload[0] = 2
	// r.payload = encrypt(r.payload)
	// write(r.build())
	// console.log('REQ','D4',r.payload.toString('hex'),decrypt(r.payload).toString('hex'))
}

pad.on('data',function(data){
	read(data)
	if(data[0] == 0x55)
	{
		var res = new Response(data)
		console.log('RES',res.payload.toString('hex'),res.cid)
		// return
		if(res.cid < 3) return
		res.payload = decrypt(res.payload.slice(1))
		var a = res.payload.slice(0,4).toString('hex')
		var b = res.payload.slice(4,8).toString('hex')
		console.log('R  ',a,b)
		// var tsa =res.payload.readUInt32BE(0)
		// var tsb =res.payload.readUInt32BE(4)
		// seed('ta',tsa)
		// seed('tb',tsb)
		// console.log(a,b,prng('ta').toString(16),prng('tb').toString(16))
		// console.log(nums.a.indexOf(a),nums.b.indexOf(b),nums.a.indexOf(b),nums.b.indexOf(a))
	}else if(data[0] == 0x56)
	{
		var ev = new Event(data)
		console.log('EV ',data.toString('hex'))
		if(ev.dir == 1) return 
		var r = new Request()
		r.cmd = 0xD4
		r.cid = id()
		r.payload = new Buffer('005c2e173cdc7983','hex')
		r.payload[0] = ev.index
		r.payload = encrypt(r.payload)
		write(r.build())
		console.log('REQ','D4',r.payload.toString('hex'),decrypt(r.payload).toString('hex'))
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


init()

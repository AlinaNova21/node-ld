var ld = require('../')
var Frame = ld.Frame
var Request = ld.Request
var Response = ld.Response
var Event = ld.Event
var pad = new ld.transports.TCPClientTransport('nas.remote.ovh',9998)
function init(){
	// var b = new Buffer(8)
	// b.fill(0)
	// var b = encrypt(b)
	// var b = decrypt(b)
	// encrypt(b)
	// b.fill(0)
	// b[7] = 1
	// encrypt(b)
	var buffers = [
		new Buffer("444014a1db6d9b1c","hex"),
		new Buffer("99a6d6c70ee52f81","hex"),
		new Buffer("598e3589c5645ee6","hex"),
	]

	buffers.forEach(function(b){
		console.log(decrypt(b).toString('hex'))
	})

	for(var i=0;i<5;i++)
		console.log(prng().toString(16),prng().toString(16))
	process.exit()
	// return 

	var r = new Request()
	r.cmd = Request.CMD_WAKE
	r.cid = id()
	r.payload = new Buffer('(c) LEGO 2014')
	write(r.build())

	r.payload = new Buffer(8)
	r.cmd = Request.CMD_SEED
	r.cid = id()
	r.payload.fill(0)
	r.payload = encrypt(r.payload)
	write(r.build())

	return 
	r.cmd = Request.CMD_CHAL
	r.cid = id()
	r.payload.fill(0)
	r.payload = encrypt(r.payload)
	write(r.build())
	r.cid = id()
}

pad.on('data',function(data){
	read(data)
	if(data[0] == 0x55)
	{
		var res = new Response(data)
		// console.log('UX',res.payload.toString('hex'))
		if(!res.cid) return
		res.payload = decrypt(res.payload)
	}else if(data[0] == 0x56)
	{

	}
})

function read(data){
	// console.log('UX',data.toString('hex'))
}

function write(data){
	// console.log('XU',data.toString('hex'))
	// console.log(callbacks.cbs)
	pad.write(data)
}

var lastid = 0
function id(){
	return (lastid++ % 256)
}


var prngglobal = 0
function prng(){
    prngglobal = ((prngglobal * 0x19660D) + 0x3C6EF35F) >>> 0
    return prngglobal
}

var key = [0x55FEF630,0x62BF0BC1,0xC9B37C34,0x973E29FB]
// var key = [0,0,0,0]

function encrypt(buffer){
	var buf = new Buffer(8)
	var d2 = ToUint32(buffer.readInt32BE(4))
	var d1 = ToUint32(buffer.readInt32BE(0))
	var data = TEA.encipher([d1,d2],key)
	buf.writeUInt32BE(data[0],0)
	buf.writeUInt32BE(data[1],4)
	console.log('ENCRYPT',buffer.toString('hex'),buf.toString('hex'))
	return buf
}

function decrypt(buffer){
	var buf = new Buffer(8)
	var d1 = buffer.readUInt32BE(0)
	var d2 = buffer.readUInt32BE(4)
	var data = TEA.decipher([d1,d2],key)
	buf.writeUInt32BE(data[0],0)
	buf.writeUInt32BE(data[1],4)
	console.log('DECRYPT',buffer.toString('hex'),buf.toString('hex'))
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
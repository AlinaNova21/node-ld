console.log("Legacy code, see toypadEmu.js instead")
process.exit()

var fs = require('fs')
var ld = require('../')
var Frame = ld.Frame
var Request = ld.Request
var Response = ld.Response
var Event = ld.Event
var Burtle = require('../lib/Burtle')
var TEA = ld.TEA
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
uid = new Buffer('040DC5BA6D4081','hex')
uid[4] = Math.round(Math.random() * 256) % 256
uid[5] = Math.round(Math.random() * 256) % 256
uid[6] = Math.round(Math.random() * 256) % 256
uid[7] = Math.round(Math.random() * 256) % 256
Gandalf.uid = uid.toString('hex').toUpperCase()



var Batmobile = fs.readFileSync('./dumps/040DC5BA6D4081.bin')
Batmobile.uid = '040DC5BA6D4081'
uid = new Buffer('040DC5BA6D4081','hex')
uid[4] = Math.round(Math.random() * 256) % 256
uid[5] = Math.round(Math.random() * 256) % 256
uid[6] = Math.round(Math.random() * 256) % 256
uid[7] = Math.round(Math.random() * 256) % 256
Batmobile.uid = uid.toString('hex').toUpperCase()

Batmobile[(0x24*4)+0] = 0x4B
Batmobile[(0x24*4)+1] = 0x04

var tokens = [
	Gandalf,
	Batmobile
]

PlaceTag(1,0,tokens[0].uid)
PlaceTag(2,1,tokens[1].uid)
console.log('init')

function WAKE(req,res){
	res.payload = new Buffer('286329204c45474f2032303134','hex')
	PlaceTag(1,0,tokens[0].uid)
	PlaceTag(2,1,tokens[1].uid)
}

function READ(req,res){
	var ind = req.payload[0]
	var page = req.payload[1]
	res.payload = new Buffer(17)
	res.payload[0] = 0
	var start = page * 4
	tokens[ind].copy(res.payload,1,start,start + 16)
}

function MODEL(req,res){
	req.decrypt()
	console.log('D4',req.payload.toString('hex'))
	var buf = req.payload
	buf[0] = 14
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

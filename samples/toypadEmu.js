var ld = require('../')

var tp = new ld.ToyPadEmu()

// var tp = new ld.ToyPadEmu({ transport: false })
// tp.setTransport(new ld.transports.DummyTransport())

var TARDIS = createVehicle(1030).toString('hex').replace(/([0-9a-f]{2})/g,'$1 ')
var TheDoctor = createCharacter(1030).toString('hex').replace(/([0-9a-f]{2})/g,'$1 ')

tp.hook(tp.CMD_WAKE,(req,res)=>{
	tp.place(TARDIS,2,0,uid)
	tp.place(TheDoctor,2,1,uid)
})

function createVehicle(id,upgrades){
	upgrades = upgrades || [0,0]
	var token = new Buffer(180)
	token.fill(0)
	token.uid = tp.randomUID()
	var uid = new Buffer(token.uid,'hex')
	uid.copy(token,0,0,3)
	uid.copy(token,4,3,7)

	token.writeUInt16LE(id,0x24*4)
	token.writeUInt32LE(upgrades[0],0x23*4)
	token.writeUInt32LE(upgrades[1],0x25*4)
	token.writeUInt16BE(1,0x26*4)
	return token;
}

function createCharacter(id){
	var token = new Buffer(180)
	token.fill(0)
	token.uid = tp.randomUID()
	var uid = new Buffer(token.uid,'hex')
	uid.copy(token,0,0,3)
	uid.copy(token,4,3,7)


	token.id = id
	return token;
}

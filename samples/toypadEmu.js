var ld = require('../')

var tp = new ld.ToyPadEmu()

tp.registerDefaults() // Default command processors, can be overridden by res.preventDefault() in hooks

// tp.on('request',r=>console.log('REQ',r))
// tp.on('response',r=>console.log('RES',r))
// tp.on('event',e=>console.log('EV ',e))

var TARDIS = createVehicle(1030,[0xEFFFFFFF,0xEFFFFFFF]) //.toString('hex').replace(/([0-9a-f]{2})/g,'$1 ')
var TheDoctor = createCharacter(15) //.toString('hex').replace(/([0-9a-f]{2})/g,'$1 ')

tp.place(TARDIS,2,0,TARDIS.uid)
tp.place(TheDoctor,2,1,TheDoctor.uid)

function createVehicle(id,upgrades){
	upgrades = upgrades || [0,0]
	var token = new Buffer(180)
	token.fill(0)
	token.uid = tp.randomUID()
	token.writeUInt32LE(upgrades[0],0x23*4)
	token.writeUInt16LE(id,0x24*4)
	token.writeUInt32LE(upgrades[1],0x25*4)
	token.writeUInt16BE(1,0x26*4)
	return token;
}

function createCharacter(id){
	var token = new Buffer(180)
	token.fill(0) // Game really only cares about 0x26 being 0 and D4 returning an ID
	token.uid = tp.randomUID()
	token.id = id
	return token;
}

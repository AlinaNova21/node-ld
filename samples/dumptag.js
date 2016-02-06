var ld = require('../')
var fs = require('fs')
var async = require('async')

var toypad = new ld.ToyPad()

fs.mkdir('dumps',()=>{})

toypad.on('ready',()=>{
	toypad.wake()
	toypad.color(0,'#00FF00')
	toypad.on('event',(ev)=>ev.dir?null:dumpTag(ev.uid,ev.pad,ev.index))
})

function dumpTag(uid,pad,index){
	// toypad.color(pad,'#000000')
	toypad.fade(pad,5,1,'#FF0000')
	console.log('Starting dump for',uid.toString('hex'))

	var TAGSIZE = 180
	var PAGESPERREAD = 4
	var PAGESIZE = 4
	var PAGECNT = TAGSIZE/PAGESIZE
	
	var b = new Buffer(TAGSIZE)
	b.fill(0)
	
	var tasks = []
	
	for(var page=0;page<PAGECNT;page+=PAGESPERREAD)
		tasks.push(page)

	var cnt = PAGECNT
	var worker = function(page,cb){
		toypad.read(index,page,(err,resp)=>{
			// console.log('Remaining',--cnt,page,resp.payload)
			resp.payload.slice(1).copy(b,page*PAGESPERREAD)
			cb()
		})
	}

	async.eachLimit(tasks,5,worker,function(){
		toypad.color(pad,'#FFFF00')
		fs.writeFile('dumps/'+uid.toString('hex').toUpperCase()+'.bin',b)
		console.log('Finished dump for',uid.toString('hex'))
		toypad.fade(pad,5,1,'#00FF00')
		// toypad.color(pad,'#00FF00')
	})
}
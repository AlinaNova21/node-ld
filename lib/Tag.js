function Tag(data){
	this.TAG_SIZE = 180
	this.PAGE_SIZE = 4
	this.PAGES_PER_READ = 4
	this.data = data || new Buffer(this.TAG_SIZE)
	self.init()
}

Tag.prototype.init = function(){
	this.uid = this.data.slice(0,3).toString('hex') + this.data.slice(4,8).toString('hex')
}

Tag.prototype.get = function(page){
	var start = page * this.PAGE_SIZE
	var end = start + this.PAGE_SIZE
	return this.data.slice(start,end)
}

Tag.prototype.set = function(page,data){
	var start = page * this.PAGE_SIZE
	data.copy(this.data,start)
}

Tag.prototype.readFile = function(file,cb){
	var self = this
	cb = cb || function(){}
	fs.readFile(file,function(err,data){
		if(err) return cb(err)
		self.data = data
		self.init()
		cb()
	})
}

Tag.prototype.writeFile = function(file,cb){
	cb = cb || function(){}
	fs.writeFile(file,this.data,function(err){
		cb(err)
	})
}

module.exports = Tag
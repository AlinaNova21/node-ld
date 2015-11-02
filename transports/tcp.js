var net = require('net')
var util = require('util')
var EventEmitter = require('events').EventEmitter;
util.inherits(TCPClientTransport, EventEmitter);
util.inherits(TCPServerTransport, EventEmitter);

function TCPClientTransport(host,port){
	var self = this
	var client = self.client = net.connect({ 
		host: host,
		port: port 
	},function(){
		client.on('data',dataBuffer(self.emit.bind(self,'data')))
		client.on('end',function(){
			self.emit('end')
		})
	})
}

TCPClientTransport.prototype.write = function(buffer){
	this.client.write(buffer)
}

function TCPServerTransport(port){
	var self = this
	self.clients = [];
	self.srv = net.createServer(function(c){
		clients.push(c)
		c.on('data',dataBuffer(self.emit.bind(self,'data')))
		c.on('end',function(){ 
			var ind = self.clients.indexOf(c)
			self.clients = self.clients.splice(ind,1)
		})
	})

	self.srv.listen(port)
}

TCPServerTransport.prototype.write = function(buffer){
	var self = this
	this.clients.forEach(function(c){
		try{ 
			c.write(buffer)
		}catch(e){
			var ind = self.clients.indexOf(c)
			self.clients = self.clients.splice(ind,1)
		}
	})
}

function dataBuffer(cb){
	var buf = new Buffer(1024)
	var ind = 0;
	return function(data){
		data.copy(buf,ind)
		ind += data.length
		while(ind >= 0x20){
			var b = new Buffer(0x20)
			buf.copy(b,0)
			cb('data',b)
			buf.copy(buf,0,0x20)
			ind -= 0x20
		}
	}
}

module.exports = {
	client: TCPClientTransport,
	server: TCPServerTransport
}
var net = require('net')
var util = require('util')
var EventEmitter = require('events').EventEmitter;
util.inherits(TCPClientTransport, EventEmitter);
util.inherits(TCPServerTransport, EventEmitter);

function TCPClientTransport(host,port){
	if(global.__tcpclienttransport) return global.__tcpclienttransport
	global.__tcpclienttransport = this
	var self = this
	EventEmitter.call(this)
	if(host && port) self.connect(host,port)
}

TCPClientTransport.prototype.isConnected = function(){
	return !!this.client;
}

TCPClientTransport.prototype.connect = function(host,port){
	var self = this
	console.log('Attempting connection to',host,port)
	var client = self.client = net.connect({ 
		host: host,
		port: port 
	},function(){
		console.log('TCP Client connected',host,port)
		self.emit('connected',null)
		client.on('data',dataBuffer(self.emit.bind(self,'data')))
		client.on('end',function(){
			self.emit('end')
			self.emit('disconnected')
			self.client = null
		})
	})
	client.on('connect',(...args)=>console.log(...args))
	client.on('error',(...args)=>console.log(...args))
}

TCPClientTransport.prototype.disconnect = function(){
	if(!this.isConnected()) return
	this.client.disconnect()
}

TCPClientTransport.prototype.write = function(buffer){
	if(!this.isConnected()) return
	this.client.write(buffer)
}

function TCPServerTransport(port){
	var self = this
	EventEmitter.call(this)
	self.clients = [];
	self.srv = net.createServer(function(c){
		console.log('client connected')
		self.clients.push(c)
		c.on('data',dataBuffer(self.emit.bind(self,'data')))
		c.on('end',function(){
			console.log('client disconnected')
			var ind = self.clients.indexOf(c)
			self.clients.splice(ind,1)
		})
	})

	self.srv.listen(port)
}

TCPServerTransport.prototype.port = function(){
	return this.srv.address().port;
}

TCPServerTransport.prototype.write = function(buffer){
	var self = this
	this.clients.forEach(function(c){
		try{ 
			c.write(buffer)
		}catch(e){
			var ind = self.clients.indexOf(c)
			console.log('Exception in client',ind,e)
			self.clients.splice(ind,1)
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
			cb(b)
			buf.copy(buf,0,0x20)
			ind -= 0x20
		}
	}
}

module.exports = {
	TCPClientTransport: TCPClientTransport,
	TCPServerTransport: TCPServerTransport
}

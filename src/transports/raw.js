var fs = require('fs')
var net = require('net')
var util = require('util')
var EventEmitter = require('events').EventEmitter;
util.inherits(RawTransport, EventEmitter);

function RawTransport(path){
    var self = this
    var fd = this.fd = fs.openSync(path,'r+')
   	this.readstr   = fs.createReadStream(path).on('data',dataBuffer(self.emit.bind(self)))
   	this.writestr = fs.createWriteStream(path)
}

RawTransport.prototype.write = function(buffer){
    this.writestr.write(buffer)
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

module.exports = RawTransport

var util = require('util')
var EventEmitter = require('events').EventEmitter;
util.inherits(DummyTransport, EventEmitter);

function DummyTransport(path){
    // Stub!
}

DummyTransport.prototype.write = function(buffer){
    // Stub!
}

module.exports = DummyTransport

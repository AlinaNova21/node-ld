var ld = require('../../')
var TCPClientTransport = ld.transports.TCPClientTransport


var trans = new TCPClientTransport('localhost',9999)

var tp = new ld.ToyPad({ transport: trans })


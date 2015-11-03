var ld = require('../../')
var TCPClientTransport = ld.transports.TCPClientTransport


var trans = new TCPClientTransport('localhost',9999)

var tp = new ld.ToyPad({ transport: trans })


tp.on('event',(e)=>console.log('event',e))
tp.on('response',(e)=>console.log('response',e))
// tp.on('raw',(e)=>console.log('raw',e))

tp.wake((r) => console.log('Awoke!',r))

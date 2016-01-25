var ld = require('..')
var CharCrypto = ld.CharCrypto;

var raw = new Buffer('b27cc8c717a8b4e1','hex') // Page 25+26
var uid = '040b4922a34881'

var cc = new CharCrypto()
var id = cc.decrypt(uid,raw)
console.log(id,id.toString(16))

var data = cc.encrypt(uid,id)
console.log(data)


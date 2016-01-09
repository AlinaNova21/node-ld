var ld = require('..')

var pwdgen = ld.PWDGen;

var uid = process.argv[2] || null
if(uid)
	console.log(uid,'=>',pwdgen(uid))
else
	console.log('USAGE: node pwdgen.js <7 byte uid in HEX>')

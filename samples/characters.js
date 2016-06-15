var readline = require('readline');
var fs = require('fs');

var ld = require('..');
var CharCrypto = ld.CharCrypto;
var PWDGen = ld.PWDGen;

rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var characters = JSON.parse(fs.readFileSync('./data/charactermap.json', 'utf8'));

rl.question("Enter NFC's UID: ", function(uid) {
    var cc = new CharCrypto();
    console.log("");
    console.log("... [Page  36] [Page  37] ... [Page  43]");

    for (character in characters) {
        console.log("... [" + cc.encrypt(uid, characters[character].id).toString("hex").substring(0, 8)  + "] " +
            "[" + cc.encrypt(uid, characters[character].id).toString("hex").substring(8, 16)  + "] ... " +
            "[" + PWDGen(uid).toString(16) + "] " + characters[character].name);
    }
  rl.close();
});


var readline = require('readline');
var fs = require('fs');

var ld = require('..');
var CharCrypto = ld.CharCrypto;
var PWDGen = ld.PWDGen;
var pad = require('pad');

rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var characters = JSON.parse(fs.readFileSync('../data/charactermap.json', 'utf8'));

rl.question("Enter NFC's UID: ", function(uid) {
    var cc = new CharCrypto();
    console.log("");
    console.log("... [Page  36] [Page  37] ... [Page  43]");

    for (character in characters) {
        var characterCode = pad(16, cc.encrypt(uid, characters[character].id).toString("hex"), '0');
        var pwd = pad(8, PWDGen(uid).toString(16), '0');
        console.log(
            "... [" + characterCode.substring(0, 8)  + "] [" + characterCode.substring(8, 16)  + "] ... " +
            "[" + pwd + "] " + characters[character].name);
    }
  rl.close();
});


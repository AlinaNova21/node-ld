var ld = require ('../index')

// Initialize the toypad. By default it tries loading the HID transport on Windows and Mac, and LibUSB on linux
// (libusb-1.0 must be installed for both hid and libusb transports on linux)
var toypad = new ld.ToyPad ()

// Wake the toypad, it will not respond to commands at all unless woken
// All commands currently accept an optional callback in the form of function(err,Response)
// Response will probably swapped out for a per command return value in the future to simplify things.
toypad.wake (function (e, d) {
    console.log ('WAKE RET', d.toString ('hex'))
  }
)


// First is pad (0 for all, 1 for top, 2 for left, 3 for right)
// Second is color in #RRGGBB HEX format
toypad.color (0, '#FF0000')


var initiateWrite = function () {
  setTimeout (function () {

    //0x8E 0x04 is the desired vehicle
    var out1 = new Buffer ([0x8E, 0x04, 0x00, 0x00])
    var out2 = new Buffer ([0x00, 0x00, 0x00, 0x00]);
    var out3 = new Buffer ([0x00, 0x00, 0x00, 0x00]);
    var out4 = new Buffer ([0x00, 0x00, 0x00, 0x00]);

    toypad.write (0, 0x24, out1, function () {
      toypad.color (1, '#FFFFFF')
      toypad.write (0, 0x25, out2, function () {
        toypad.color (2, '#FFFFFF')
        toypad.write (0, 0x26, out3, function () {
          toypad.color (3, '#FFFFFF')
          toypad.write (0, 0x27, out4, function () {
            toypad.color (0, '#00FF00')
          })
        })
      })
    })
  }, 5000)
}

console.log ('YOU HAVE 5 SECONDS TO PLACE ONE GAME DISC ONTO TOY PAD BEFORE IT IS WRITTEN')
initiateWrite ();

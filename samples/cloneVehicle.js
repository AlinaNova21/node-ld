var ld = require ('../index')

// Initialize the toypad. By default it tries loading the HID transport on Windows and Mac, and LibUSB on linux
// (libusb-1.0 must be installed for both hid and libusb transports on linux)
var toypad = new ld.ToyPad ()

// Wake the toypad, it will not respond to commands at all unless woken
// All commands currently accept an optional callback in the form of function(err,Response)
// Response will probably swapped out for a per command return value in the future to simplify things.
toypad.wake (function (e, d) {
    console.log ('Toypad responded : READY')
  }
)


// First is pad (0 for all, 1 for top, 2 for left, 3 for right)
// Second is color in #RRGGBB HEX format
toypad.color (0, '#FF0000')

var out = [];
setTimeout (function () {
  toypad.read (0, 0x24, function () {
    console.log ('READING ORIGINAL VEHICLE DISC')
    out = arguments[1].payload;
    console.log ('YOU HAVE 5 SECONDS. PLACE CLONE TARGET GAME DISC ONTO GAME PAD')
    initiateWrite ();
  })
}, 1000)

var initiateWrite = function () {
  setTimeout (function () {
    var out1 = out.slice (1, 5);
    var out2 = out.slice (5, 9);
    var out3 = out.slice (9, 13);
    var out4 = out.slice (13, 17); //Not sure this can be overwritten but fails silently so might as well for completeness

    toypad.write (1, 0x24, out1, function () {
      toypad.color (1, '#FFFFFF')
      toypad.write (1, 0x25, out2, function () {
        toypad.color (1, '#FFFFFF')
        toypad.write (2, 0x26, out3, function () {
          toypad.color (1, '#FFFFFF')
          toypad.write (3, 0x27, out4, function () {
            toypad.color (01, '#00FF00')
            console.log ("VEHICLE CLONED");
          })
        })
      })
    })
  }, 5000)
}

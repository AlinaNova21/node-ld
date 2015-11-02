# Transports

There are several transport wrappers that provide a generic interface to the pad or console

| Transport 		 | Params     | Desc |
| ------------------ | ---------- | ---- |
| LibUSBTransport 	 | None       | Uses libusb. Looks for the toypad PID/VID pair. Should work cross platform |
| TCPClientTransport | Host, Port | Connects to a TCP port. Useful for remote access |
| TCPServerTransport | Port       | Hosts a TCP port. Useful for remote access |
| RawTransport 	     | Path       | Opens a file for read/write. I use this with /dev/hidraw0 and /dev/hidg0 |
| SerialTransport    | Port,Baud  | Connects to a local serialport |

All transports are accessible via the transports object
Ex: 
```javascript
var ld = require('node-ld')
var serial = new ld.transports.SerialTransport('/dev/ttyUSB0',56000)
```

## API

All transports inherit EventEmitter

### Events

#### data
Buffer containing a 32 Byte packet

### Methods 

#### write(Buffer data)

Writes data to the transport.
SHOULD be 32 Bytes, zero pad if needed. 
Any other length may prevent the transport from working as intended.
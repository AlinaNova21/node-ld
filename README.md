## Node.js Lego Dimensions Library

Node.js 4.1 or higher recommended. https://nodejs.org
Tested and developed on node.js 5.0+

### Installation
```bash
git clone git@github.com:ags131/node-ld
cd node-ld
npm install
```

### Windows
Install node-4.1.2 (Latest version that works with node-usb)
64Bit: https://nodejs.org/dist/v4.1.2/node-v4.1.2-x64.msi
32Bit: https://nodejs.org/dist/v4.1.2/node-v4.1.2-x86.msi

Use Zadig to (In tools folder) to install the USB driver
    1. Connect the ToyPad
	2. Launch Zadig
	3. Select Options > List All Devices
	4. Use the dropdown to select `LEGO READER V2.10`
	5. Click Install Driver
	6. You may have to unplug and replug the portal for it to take effect.
	7. At this point, this library should connect to it via the LibUSBTransport

See samples folder for example usage




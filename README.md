## Node.js Lego Dimensions Library

[![Join the chat at https://gitter.im/ags131/node-ld](https://badges.gitter.im/ags131/node-ld.svg)](https://gitter.im/ags131/node-ld?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

![npm](https://nodei.co/npm/node-ld.png "NPM")

NOTE: This does not currently work for the Xbox version of the toypad. It will connect but no responses will be received. If someone manages to get it working, please let me know so I can make this more compatible.

### Requirements 
Node.js 4.1 or newer. https://nodejs.org
Tested and developed on node.js 4.1+

I also have a repo available for PC and Arm 

```bash
wget -O - http://repo.ags131.com/install.sh | sudo bash -
sudo apt-get update
sudo apt-get install nodejs
```

#### Linux 
libusb-1.0

### Installation

```bash
git clone git@github.com:ags131/node-ld
cd node-ld
npm install
```

### Windows libUSB setup (Only if using LibUSBTransport)
#### The following instructions are only needed if using the LibUSBTransport. 
#### The default transport is HIDTransport and works without a driver install.
Install node-4.1.2 (Latest version that works with node-usb)
[32Bit](https://nodejs.org/dist/v4.1.2/node-v4.1.2-x86.msi)
or
[64Bit](https://nodejs.org/dist/v4.1.2/node-v4.1.2-x64.msi)

Use Zadig to (In tools folder) to install the USB driver

1. Connect the ToyPad
2. Launch Zadig
3. Select Options > List All Devices
4. Use the dropdown to select `LEGO READER V2.10`
5. Click Install Driver
6. You may have to unplug and replug the portal for it to take effect.
7. At this point, this library should connect to it via the LibUSBTransport

### Samples

See demo.js and toypadDemo.js in the samples folder for example usage




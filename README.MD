# DOMUSTO Philips HUE plugin

```
plugin:       Philips HUE
author:       Bas van Dijk
category:     system
version:      0.0.1
website:      http://domusto.com
description:  Control Philips HUE devices
```

## Hardware needed
- Philips HUE bridge
- Philips HUE devices

## Tested with
- not tested

## Installation

Execute in the domusto-server folder:
```sh
$ ./domusto.js plugin add basvdijk/domusto-philips-hue
```

# Configuration

1. Add the section below to your `config.ts`
2. Set the correct ip and username
3. Restart DOMUSTO

```js
{
    id: 'PHILIPS-HUE',
    enabled: true,
    dummyData: false,
    settings: {
        ip: '192.168.178.51',
        username: '08a902b95915cdd9b75547cb50892dc4'
    }
},
```

## Example devices
```js

// SWITCH FOR SINGLE LIGHT WITH ID 1
{
    id: 'LIVING',
    enabled: true,
    role: 'output',
    name: 'Living',
    type: 'switch',
    subType: 'on/off',
    plugin: {
        id: 'PHILIPS-HUE',
        deviceId: 'L1'
    }
},

// SWITCH FOR GROUP WITH ID 2
{
    id: 'KITCHEN',
    enabled: true,
    role: 'output',
    name: 'Kitchen',
    type: 'switch',
    subType: 'on/off',
    plugin: {
        id: 'PHILIPS-HUE',
        deviceId: 'G2'
    }
},
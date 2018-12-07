# openjscam

A TPLang inspired JavaScript to G-Code preprocessor in pure JavaScript.

## installation

OpenJSCAM can be installed using any node package manager, in this example we will use npm.

```shell
npm install --save openjscam
```

You can also grab the `bundle.js` file in the root of the project, which contains the code + dependencies all together in one file.
It puts all the openjscam functions on the `window.openjscam` property, this is usefull for running it in the browser.

## usage

You can add openjscam as a dependency to you project, then import the functions you need, or make all of them available in your scope by using the `with (openjscad) {}` operator


Example using `require`:
```js
const {
    rapid,
    cut,
    icut,
    log
} = require('openjscad')

const zSafe = 3
const zCut = -1.5

rapid({ z: zSafe })
rapid({ x: 0, y: 0 })
cut({ z: zCut })
cut({ y: 100 })
cut({ x: 100 })
cut({ y: -100 })
cut({ x: -100 })
rapid({ z: zSafe })
log()
```

Example using `with (openjscad) {}`
```js
const openjscad = require('openjscad')

// by using `with`, all properties of the `openjscad` object are automatically available in it's scope.
with (openjscad) {
    const zSafe = 3
    const zCut = -1.5

    rapid({ z: zSafe })
    rapid({ x: 0, y: 0 })
    cut({ z: zCut })
    cut({ y: 100 })
    cut({ x: 100 })
    cut({ y: -100 })
    cut({ x: -100 })
    rapid({ z: zSafe })
    log()
}
```

## api

### units(units: METRIC | IMPERIAL)

Set the units (Will output `G21` for METRIC or `G20` for IMPERIAL)

#### example

```js
const { units, METRIC, log } = require('openjscad')
units(METRIC)
log()
```

**output**

```gcode
G21
```

### tool(tool: number)

Set the tool to use (usefull when having a tool changer)

**NOT IMPLEMENTED YET**

#### example

```js
const { tool, log } = require('openjscad')
tool(1)
log()
```

### feed(feedRate: number)

Set the feedrate

#### example

```js
const { feed, log } = require('openjscad')
feed(200)
log()
```

**output**

```gcode
F200
```

### speed(speed: number)

Set the spindle speed (in RPM)

#### example

```js
const { speed, log } = require('openjscad')
speed(25000)
log()
```

**output**

```gcode
M3 S25000
```

### dwell(duration: number)

Pause for given duration, duration is given in seconds

#### example

```js
const { dwell, log } = require('openjscad')
dwell(0.5)
log()
```

**output**

```gcode
G4 P0.5
```

### cut(coordinate: Coordinate, incremental: boolean = false)

Linear movement to given coordinate. A Coordinate is an object with x, y, z properties.
Provide a coordinate for at least one of the axes.

#### example

```js
const { cut, log } = require('openjscad')
cut({ x: 10, y: 10 })
log()
```

**output**

Note that the feedrate will be set using our previous call to `feed(200)`, when no feedrate is set yet, an error will be thrown

```gcode
G1 X10 Y10
```

### icut(offset: Coordinate, incremental: boolean = true)

Incremental linear movement to given offset from last coordinate.
A Coordinate is an object with x, y, z properties.
Provide a coordinate for at least one of the axes.

#### example

```js
const { icut, log } = require('openjscad')
icut({ x: 10, y: 10 })
log()
```

**output**

Note that we assumed the last point was X10 Y10 from the previous example.

```gcode
G1 X20 Y20
```

### rapid(coordinate: Coordinate, incremental: boolean = false)

Rapid movement to given coordinate. A Coordinate is an object with x, y, z properties.
Provide a coordinate for at least one of the axes.

#### example

```js
const { rapid, log } = require('openjscad')
rapid({ x: 10, y: 10 })
log()
```

**output**

```gcode
G0 X10 Y10
```

### irapid(offset: Coordinate, incremental: boolean = true)

Incremental rapid movement to given offset from last coordinate.
A Coordinate is an object with x, y, z properties.
Provide a coordinate for at least one of the axes.

#### example

```js
const { irapid, log } = require('openjscad')
irapid({ x: 10, y: 10 })
log()
```

**output**

Note that we assumed the last point was X10 Y10 from the previous example.

```gcode
G0 X20 Y20
```

### arc(offset: Coordinate, angle: number)

Create an arc from with a given offset from the last point and an angle in degrees.

#### example

```js
const { arc, log } = require('openjscad')
arc({ x: 10 }, 180)
log()
```

**output**

Note that we assumed the last point was X0 Y0

```gcode
G2 X20 Y0 I10 J0 Z0
```

### translate(offset: Coordinate, cb: Function)

Translate (move) child operations by given offset

#### example

```js
const { translate, cut, log } = require('openjscad')
translate({ x: 100, y: 50 }, function () {
    cut({ x: 10, y: 10 })
})
log()
```

**output**

```gcode
G1 X110 Y60
```

### rotate(angle: number, cb: Function)

Rotate child operations by given angle in degrees

#### example

```js
const { rotate, cut, log } = require('openjscad')
rotate(45, function () {
    cut({ x: 10, y: 10 })
})
log()
```

**output**

```gcode
G1 X14.142 Y0 Z0
```

### log()

Log the G-Code to the console

#### example

```js
const { cut, log } = require('openjscad')
cut({ x: 10, y: 10 })
log()
```

**output**

```gcode
G1 X10 Y10
```

### save(path: string)

Save the G-Code to a file (only works in Node.JS)

#### example

```js
const { cut, save } = require('openjscad')
cut({ x: 10, y: 10 })
save('/path/to/gcode/file.gcode')
```

### gcode()

Returns the G-Code as an array of strings (lines)

#### example

```js
const { cut, gcode } = require('openjscad')
cut({ x: 10, y: 10 })
var code = gcode()
// do something with the gcode
```

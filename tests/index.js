const openjscam = require('..')
const tap = require('tap')

with (openjscam) {
    tap.throws(() => cut({ x: 10 }), {}, 'should not be able to call cut before feed')
    
    reset()
    tap.throws(() => arc({ x: 10 }), {}, 'should not be able to call arc before feed')
    
    reset()
    tap.throws(() => icut({ x: 10 }), {}, 'should not be able to call icut before feed')

    feed(200)
    tap.same(gcode(), [['F200']], 'should output a feedrate command')

    reset()
    speed(25000)
    tap.same(gcode(), [['M3 S25000']], 'should output a speed command')

    reset()
    feed(200)
    cut({ x: 100 })
    tap.same(gcode(), [['F200'], ['G1 X100']], 'should move x to 100')

    icut({ x: 1 })
    tap.same(gcode(), [['F200'], ['G1 X100'], ['G1 X101']], 'should move x to 101')

    reset()
    feed(200)
    rapid({ x: 100 })
    tap.same(gcode(), [['F200'], ['G0 X100']], 'should move x rapidly to 100')

    irapid({ x: 1 })
    tap.same(gcode(), [['F200'], ['G0 X100'], ['G0 X101']], 'should move x rapidly to 101')

    reset()
    feed(200)
    arc({ x: 100 }, 90)
    tap.same(gcode(), [['F200'], ['G2 X100 Y100 Z0 I100 J0']], 'should draw an arc')

    reset()
    feed(200)
    arc({ x: 100 }, -90)
    tap.same(gcode(), [['F200'], ['G3 X100 Y-100 Z0 I100 J0']], 'should draw a counter clockwise arc')

    reset()
    feed(200)
    ellipse(5, 1, 0, 270, 0, 64)
    ellipse(10, 1.1, 0, 360, 270, 16)
    tap.same(Math.round(state.lastCoord.x * 10000) / 10000, -5, 'ellipse end coord should be correct')
    tap.same(Math.round(state.lastCoord.y * 10000) / 10000, 0.1, 'ellipse end coord should be correct')

    reset()
    feed(200)
    icut({ y: 1 })
    icut({ x: 1 })
    icut({ y: -1 })
    icut({ x: -1 })
    tap.same(gcode(), [['F200'], ['G1 Y1'], ['G1 X1'], ['G1 Y0'], ['G1 X0']], 'should make a square')

    reset()
    feed(200)
    rotate(90, () => {
        icut({ y: 1 })
        icut({ x: 1 })
        icut({ y: -1 })
        icut({ x: -1 })
    })
    tap.same(gcode(), [['F200'], ['G1 X1'], ['G1 Y-1'], ['G1 X0'], ['G1 Y0']], 'should make a rotated square')
    
    reset()
    feed(200)
    rotate(-90, () => {
        icut({ y: 1 })
        icut({ x: 1 })
        icut({ y: -1 })
        icut({ x: -1 })
    })
    tap.same(gcode(), [['F200'], ['G1 X-1'], ['G1 Y1'], ['G1 X0'], ['G1 Y0']], 'should make a reversed rotated square')

    reset()
    feed(200)
    translate({ x: 100, y: 100, z: 100 }, () => {
        cut({ x: 0, y: 0, z: 0 })
        icut({ y: 1 })
        icut({ x: 1 })
        icut({ y: -1 })
        icut({ x: -1 })
    })
    tap.same(gcode(), [['F200'], ['G1 X100 Y100 Z100'], ['G1 Y101'], ['G1 X101'], ['G1 Y100'], ['G1 X100']], 'should make an translated square')

    reset()
    feed(200)
    translate({ x: 100, y: 100, z: 100 }, () => {
        cut({ x: 0, y: 0, z: 0 })
        icut({ y: 1 })
        icut({ x: 1 })
        icut({ y: -1 })
        icut({ x: -1 })
    })
    tap.same(gcode(), [['F200'], ['G1 X100 Y100 Z100'], ['G1 Y101'], ['G1 X101'], ['G1 Y100'], ['G1 X100']], 'should make an translated square')

    reset()
    feed(200)
    rotate(180, () => {
        translate({ x: 100, y: 100, z: 100 }, () => {
            cut({ x: 0, y: 0, z: 0 })
            icut({ y: 1 })
            icut({ x: 1 })
            icut({ y: -1 })
            icut({ x: -1 })
        })
    })
    tap.same(gcode(), [['F200'], ['G1 X-100 Y-100 Z100'], ['G1 Y-101'], ['G1 X-101'], ['G1 Y-100'], ['G1 X-100']], 'should make an rotated and translated square')
 
    reset()
    feed(200)
    rapid({ y: 1 })
    icut({ y: 8 })
    arc({ x: 1 }, 90)
    icut({ x: 8 })
    arc({ y: -1 }, 90)
    icut({ y: -8 })
    arc({ x: -1 }, 90)
    icut({ x: -8 })
    arc({ y: 1 }, 90)
    tap.same(gcode(), [['F200'],['G0 Y1'],['G1 Y9'],['G2 X1 Y10 Z0 I1 J0'],['G1 X9'],['G2 X10 Y9 Z0 I0 J-1'],['G1 Y1'],['G2 X9 Y0 Z0 I-1 J0'],['G1 X1'],['G2 X0 Y1 Z0 I0 J1']], 'should make a square with rounded corners')
   
    // console.log(JSON.stringify(gcode()))
    // log()
}
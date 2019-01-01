const openjscam = require('..')

with (openjscam) {
    feed(400)
    function roundedSquare(offset) {
            rapid({ x: offset.x, y: offset.y + 1 })
            icut({ y: 8 })
            arc({ x: 1 }, 90)
            icut({ x: 8 })
            arc({ y: -1 }, 90)
            icut({ y: -8 })
            arc({ x: -1 }, 90)
            icut({ x: -8 })
            arc({ y: 1 }, 90)
            // icut({ y: 8 })
            // radiusArc(1, 270, 360)
            // icut({ x: 8 })
            // radiusArc(1, 0, 90)
            // icut({ y: -8 })
            // radiusArc(1, 90, 180)
            // icut({ x: -8 })
            // radiusArc(1, 180, 270)
    }
    function square(offset) {
        rapid({ x: offset.x, y: offset.y })
        icut({ y: 10 })
        icut({ x: 10 })
        icut({ y: -10 })
        icut({ x: -10 })
    }
    scale({ x: 0.5, y: 0.25 }, () => {
        // rotate(45, () => {
            roundedSquare({ x: 0, y: 0 })
            roundedSquare({ x: 10, y: 0 })
            roundedSquare({ x: 0, y: 10 })
            roundedSquare({ x: 10, y: 10 })
        // })
    })
    console.log('-----------')
    log()
    view()
}
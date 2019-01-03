import * as THREE from 'three'

import { Plane, XZ } from '../constants'
import Coordinate from '../coordinate'
import { mirrorCoord } from '../utils'

export default class RadiusArc {
    curve: THREE.EllipseCurve

    constructor(
        public radius: number,
        public startAngle: number,
        public endAngle: number = 0,
        public plane: Plane = XZ
    ) {
        var degreesStart = 90 - this.startAngle;
        var degreesEnd = 90 - this.endAngle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = ((degreesEnd) * Math.PI) / 180;
        this.curve = new THREE.EllipseCurve(
            0,
            0,
            this.radius,
            this.radius,
            radiansStart,
            radiansEnd,
            this.startAngle < this.endAngle,
            0
        ) 
    }

    getCurve() {
        return this.curve
    }

    getCenterOffset() {
        const coord = this.curve.getPoint(0)
        return {
            x: coord.x > 0 ? -coord.x : Math.abs(coord.x),
            y: coord.y > 0 ? -coord.y : Math.abs(coord.y)
        }
    }

    getOffset() {
        const inCoord = this.curve.getPoint(0)
        const outCoord = this.curve.getPoint(1)
        return {
            x: outCoord.x - inCoord.x,
            y: outCoord.y - inCoord.y
        }
    }

    getCurveForInCoord(inCoord: Coordinate) {
        const firstCoord = this.curve.getPoint(0)
        const mirror = mirrorCoord({ x: firstCoord.x, y: firstCoord.y })
        this.curve.aX = inCoord.x! + mirror.x!
        this.curve.aY = inCoord.y! + mirror.y!
        return this.curve
    }
}
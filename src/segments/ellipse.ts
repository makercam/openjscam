import * as THREE from 'three'

import { Plane, XZ } from '../constants'
import { mirrorCoord } from '../utils'
import Coordinate from '../coordinate'

export default class Ellipse {
    curve: THREE.EllipseCurve

    constructor(
        public radiusX: number,
        public radiusY: number,
        public offsetZ: number,
        public angleEnd: number,
        public angleStart: number = 0,
        public plane: Plane = XZ,
    ) {
        var degreesStart = 90 - this.angleStart
        var degreesEnd = 90 - this.angleEnd
        var radiansStart = (degreesStart * Math.PI) / 180
        var radiansEnd = (degreesEnd * Math.PI) / 180
        this.curve = new THREE.EllipseCurve(
            0,
            0,
            this.radiusX,
            this.radiusY,
            radiansStart,
            radiansEnd,
            this.angleStart < this.angleEnd,
            0
        )
    }
    
    getCurveForInCoord(inCoord: Coordinate) {
        const firstCoord = this.curve.getPoint(0)
        const mirror = mirrorCoord({ x: firstCoord.x, y: firstCoord.y })
        this.curve.aX = inCoord.x! + mirror.x!
        this.curve.aY = inCoord.y! + mirror.y!
        // @ts-ignore
        this.curve.startZ = inCoord.z
        // @ts-ignore
        this.curve.offsetZ = this.offsetZ
        return this.curve
    }

    getCoords(points: number) {
        const coords = this.curve.getPoints(points)
        const firstPoint = coords[0]
        const mapped = coords.map((coord, i) => {
            return {
                x: coord.x - firstPoint.x,
                y: coord.y - firstPoint.y,
                z: (this.offsetZ / points) * i
            }
        })
        return mapped
    }
}
import * as THREE from 'three'

import { Plane, XZ } from '../constants'
import Coordinate from '../coordinate'
import { mirrorCoord } from '../utils'

export default class Arc {
    curve: THREE.EllipseCurve

    constructor(
        public centerOffset: Coordinate,
        public angle: number,
        public plane: Plane = XZ
    ) {
        if (centerOffset.x === undefined) {
            centerOffset.x = 0
        }
        if (centerOffset.y === undefined) {
            centerOffset.y = 0
        }
        if (centerOffset.z === undefined) {
            centerOffset.z = 0
        }
        const fromCoord = new THREE.Vector3(0, 0, 0)
        const toCoord = new THREE.Vector3(centerOffset.x, centerOffset.y, centerOffset.z)
        const delta = new THREE.Vector2(centerOffset.x, centerOffset.y)
        const radius = fromCoord.distanceTo(toCoord)
        const angleRadians = delta.angle()
        var degreesStart = 180;
        var degreesEnd = 180 - angle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = ((degreesEnd) * Math.PI) / 180;
        this.curve = new THREE.EllipseCurve(
            0,
            0,
            radius,
            radius,
            radiansStart,
            radiansEnd,
            this.angle > 0,
            angleRadians
        )
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
        // @ts-ignore
        this.curve.startZ = inCoord.z
        return this.curve
    }
}
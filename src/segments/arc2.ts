import * as THREE from 'three'

import { Plane, XZ } from '../constants'

export default class Arc2 {
    constructor(
        public radius: number,
        public angle: number,
        public angleStart: number = 0,
        public plane: Plane = XZ
    ) {}

    getCurve() {
        var degreesStart = 180 - this.angleStart;
        var degreesEnd = 180 - this.angle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = ((degreesEnd) * Math.PI) / 180;
        return new THREE.EllipseCurve(
            0,
            0,
            this.radius,
            this.radius,
            radiansStart,
            radiansEnd,
            this.angle > 0,
            0
        )
    }

    getOffset() {
        const curve = this.getCurve()
        const inCoord = curve.getPoint(0)
        const outCoord = curve.getPoint(1)
        return {
            x: outCoord.x - inCoord.x,
            y: outCoord.y - inCoord.y
        }
    }
}
import * as THREE from 'three'

import { Plane, XZ } from '../constants'

export default class Ellipse {
    constructor(
        public radiusX: number,
        public radiusY: number,
        public offsetZ: number,
        public angle: number,
        public angleStart: number = 0,
        public points: number = 64,
        public plane: Plane = XZ,
    ) {}

    getCurve() {
        var degreesStart = 180 - this.angleStart;
        var degreesEnd = 180 - this.angle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = (degreesEnd * Math.PI) / 180;
        return new THREE.EllipseCurve(
            0,
            0,
            this.radiusX,
            this.radiusY,
            radiansStart,
            radiansEnd,
            this.angle > 0,
            0
        )
    }
    
    getCoords() {
        const curve = this.getCurve()
        const coords = curve.getPoints(this.points)
        const firstPoint = coords[0]
        const mapped = coords.map((coord, i) => {
            return {
                x: coord.x - firstPoint.x,
                y: coord.y - firstPoint.y,
                z: (this.offsetZ / this.points)
            }
        })
        return mapped
    }
}
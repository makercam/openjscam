import * as THREE from 'three'

import { Plane, XZ } from '../constants'
import Coordinate from '../coordinate'

export default class Arc {
    constructor(
        public offset: Coordinate,
        public angle: number,
        public plane: Plane = XZ
    ) {}

    getCurveForInCoord(inCoord: Coordinate) {
        if (this.offset.x === undefined) {
            this.offset.x = 0
        }
        if (this.offset.y === undefined) {
            this.offset.y = 0
        }
        if (this.offset.z === undefined) {
            this.offset.z = 0
        }
        if (inCoord.x === undefined || inCoord.y === undefined || inCoord.z === undefined) {
            throw new Error('No valid inCoord given for arc, required coordinates are x, y and z')
        }
        const inCoordVector = new THREE.Vector3(
            inCoord.x,
            inCoord.y,
            inCoord.z,
        )
        const centerCoord = new THREE.Vector3(
            inCoord.x + this.offset.x,
            inCoord.y + this.offset.y,
            inCoord.z + this.offset.z,
        )
        const delta = new THREE.Vector2(this.offset.x, this.offset.y)
        const radius = inCoordVector.distanceTo(centerCoord)
        const angleRadians = delta.angle()

        var degreesStart = 180;
        var degreesEnd = 180 - this.angle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = ((degreesEnd) * Math.PI) / 180;
        return new THREE.EllipseCurve(
            centerCoord.x,
            centerCoord.y,
            radius,
            radius,
            radiansStart,
            radiansEnd,
            this.angle > 0,
            angleRadians
        )
    }

    getOutCoordForInCoord(inCoord: Coordinate) {
        const curve = this.getCurveForInCoord(inCoord)
        if (this.angle === 360) {
            return {
                x: inCoord.x,
                y: inCoord.y,
                z: inCoord.z! + (this.offset.z || 0)
            }
        }
        const outCoord = curve.getPoint(1)
        return {
            x: outCoord.x,
            y: outCoord.y,
            z: inCoord.z! + (this.offset.z || 0)
        }
    }
}
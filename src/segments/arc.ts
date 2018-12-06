import * as THREE from 'three'

import { Plane } from '../constants'
import Coordinate from '../coordinate'

export default class Arc {
    constructor(
        public offset: Coordinate,
        public angle: number,
        public plane: Plane,
        public feedRate: number
    ) {}

    getOutCoordForInCoord(inCoord: Coordinate) {
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
        const curve = new THREE.EllipseCurve(
            centerCoord.x,
            centerCoord.y,
            radius,
            radius,
            radiansStart,
            radiansEnd,
            this.angle > 0,
            angleRadians
        )
        // curve.getPoints(100).forEach(p => {
        //     const pEl = document.createElement('div')
        //     pEl.style.width = '3px';
        //     pEl.style.height = '3px';
        //     pEl.style.position = 'absolute'
        //     pEl.style.bottom = (p.y * 10) + 400 + 'px'
        //     pEl.style.left = (p.x * 10) + 'px'
        //     pEl.style.background = 'black'
        //     document.body.appendChild(pEl)
        // })
        if (this.angle === 360) {
            return {
                x: inCoord.x,
                y: inCoord.y,
                z: inCoord.z + this.offset.z
            }
        }
        const outCoord = curve.getPoint(1)
        return {
            x: Math.round(outCoord.x * 10000) / 10000,
            y: Math.round(outCoord.y * 10000) / 10000,
            z: inCoord.z + this.offset.z
        }
    }
}
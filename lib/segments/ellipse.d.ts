import * as THREE from 'three';
import { Plane } from '../constants';
export default class Ellipse {
    radiusX: number;
    radiusY: number;
    offsetZ: number;
    angle: number;
    angleStart: number;
    points: number;
    plane: Plane;
    constructor(radiusX: number, radiusY: number, offsetZ: number, angle: number, angleStart?: number, points?: number, plane?: Plane);
    getCurve(): THREE.EllipseCurve;
    getCoords(): {
        x: number;
        y: number;
        z: number;
    }[];
}

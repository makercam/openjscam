import * as THREE from 'three';
import { Plane } from '../constants';
import Coordinate from '../coordinate';
export default class Ellipse {
    radiusX: number;
    radiusY: number;
    offsetZ: number;
    angleEnd: number;
    angleStart: number;
    plane: Plane;
    curve: THREE.EllipseCurve;
    constructor(radiusX: number, radiusY: number, offsetZ: number, angleEnd: number, angleStart?: number, plane?: Plane);
    getCurveForInCoord(inCoord: Coordinate): THREE.EllipseCurve;
    getCoords(points: number): {
        x: number;
        y: number;
        z: number;
    }[];
}

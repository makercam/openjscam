import * as THREE from 'three';
import { Plane } from '../constants';
export default class Arc2 {
    radius: number;
    angle: number;
    angleStart: number;
    plane: Plane;
    constructor(radius: number, angle: number, angleStart?: number, plane?: Plane);
    getCurve(): THREE.EllipseCurve;
    getOffset(): {
        x: number;
        y: number;
    };
}

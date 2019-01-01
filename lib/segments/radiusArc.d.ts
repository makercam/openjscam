import * as THREE from 'three';
import { Plane } from '../constants';
import Coordinate from '../coordinate';
export default class RadiusArc {
    radius: number;
    startAngle: number;
    endAngle: number;
    plane: Plane;
    curve: THREE.EllipseCurve;
    constructor(radius: number, startAngle: number, endAngle?: number, plane?: Plane);
    getCurve(): THREE.EllipseCurve;
    getCenterOffset(): {
        x: number;
        y: number;
    };
    getOffset(): {
        x: number;
        y: number;
    };
    getCurveForInCoord(inCoord: Coordinate): THREE.EllipseCurve;
}

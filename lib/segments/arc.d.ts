import * as THREE from 'three';
import { Plane } from '../constants';
import Coordinate from '../coordinate';
export default class Arc {
    centerOffset: Coordinate;
    angle: number;
    plane: Plane;
    curve: THREE.EllipseCurve;
    constructor(centerOffset: Coordinate, angle: number, plane?: Plane);
    getOffset(): {
        x: number;
        y: number;
    };
    getCurveForInCoord(inCoord: Coordinate): THREE.EllipseCurve;
}

import * as THREE from 'three';
import { Plane } from '../constants';
import Coordinate from '../coordinate';
export default class Arc {
    offset: Coordinate;
    angle: number;
    plane: Plane;
    radius: number | undefined;
    constructor(offset: Coordinate, angle: number, plane: Plane);
    constructor(offset: Coordinate, radius: number, angle: number, plane: Plane);
    getCurveForInCoord(inCoord: Coordinate): THREE.EllipseCurve;
    getOutCoordForInCoord(inCoord: Coordinate): {
        x: number | undefined;
        y: number | undefined;
        z: number;
    };
}

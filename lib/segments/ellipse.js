"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
const constants_1 = require("../constants");
const utils_1 = require("../utils");
class Ellipse {
    constructor(radiusX, radiusY, offsetZ, angleEnd, angleStart = 0, plane = constants_1.XZ) {
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.offsetZ = offsetZ;
        this.angleEnd = angleEnd;
        this.angleStart = angleStart;
        this.plane = plane;
        var degreesStart = 90 - this.angleStart;
        var degreesEnd = 90 - this.angleEnd;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = (degreesEnd * Math.PI) / 180;
        this.curve = new THREE.EllipseCurve(0, 0, this.radiusX, this.radiusY, radiansStart, radiansEnd, this.angleStart < this.angleEnd, 0);
    }
    getCurveForInCoord(inCoord) {
        const firstCoord = this.curve.getPoint(0);
        const mirror = utils_1.mirrorCoord({ x: firstCoord.x, y: firstCoord.y });
        this.curve.aX = inCoord.x + mirror.x;
        this.curve.aY = inCoord.y + mirror.y;
        // @ts-ignore
        this.curve.startZ = inCoord.z;
        // @ts-ignore
        this.curve.offsetZ = this.offsetZ;
        return this.curve;
    }
    getCoords(points) {
        const coords = this.curve.getPoints(points);
        const firstPoint = coords[0];
        const mapped = coords.map((coord, i) => {
            return {
                x: coord.x - firstPoint.x,
                y: coord.y - firstPoint.y,
                z: (this.offsetZ / points) * i
            };
        });
        return mapped;
    }
}
exports.default = Ellipse;
//# sourceMappingURL=ellipse.js.map
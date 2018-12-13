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
class Ellipse {
    constructor(radiusX, radiusY, offsetZ, angle, angleStart = 0, points = 64, plane = constants_1.XZ) {
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.offsetZ = offsetZ;
        this.angle = angle;
        this.angleStart = angleStart;
        this.points = points;
        this.plane = plane;
    }
    getCurve() {
        var degreesStart = 180 - this.angleStart;
        var degreesEnd = 180 - this.angle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = (degreesEnd * Math.PI) / 180;
        return new THREE.EllipseCurve(0, 0, this.radiusX, this.radiusY, radiansStart, radiansEnd, this.angle > 0, 0);
    }
    getCoords() {
        const curve = this.getCurve();
        const coords = curve.getPoints(this.points);
        const firstPoint = coords[0];
        const mapped = coords.map((coord, i) => {
            return {
                x: coord.x - firstPoint.x,
                y: coord.y - firstPoint.y,
                z: (this.offsetZ / this.points)
            };
        });
        return mapped;
    }
}
exports.default = Ellipse;
//# sourceMappingURL=ellipse.js.map
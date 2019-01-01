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
class RadiusArc {
    constructor(radius, startAngle, endAngle = 0, plane = constants_1.XZ) {
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.plane = plane;
        var degreesStart = 90 - this.startAngle;
        var degreesEnd = 90 - this.endAngle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = ((degreesEnd) * Math.PI) / 180;
        this.curve = new THREE.EllipseCurve(0, 0, this.radius, this.radius, radiansStart, radiansEnd, this.startAngle < this.endAngle, 0);
    }
    getCurve() {
        return this.curve;
    }
    getCenterOffset() {
        const coord = this.curve.getPoint(0);
        return {
            x: coord.x > 0 ? -coord.x : Math.abs(coord.x),
            y: coord.y > 0 ? -coord.y : Math.abs(coord.y)
        };
    }
    getOffset() {
        const inCoord = this.curve.getPoint(0);
        const outCoord = this.curve.getPoint(1);
        return {
            x: outCoord.x - inCoord.x,
            y: outCoord.y - inCoord.y
        };
    }
    getCurveForInCoord(inCoord) {
        const firstCoord = this.curve.getPoint(0);
        const mirror = utils_1.mirrorCoord(firstCoord);
        this.curve.aX = inCoord.x + mirror.x;
        this.curve.aY = inCoord.y + mirror.y;
        return this.curve;
    }
}
exports.default = RadiusArc;
//# sourceMappingURL=radiusArc.js.map
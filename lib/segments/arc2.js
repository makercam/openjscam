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
class Arc2 {
    constructor(radius, angle, angleStart = 0, plane = constants_1.XZ) {
        this.radius = radius;
        this.angle = angle;
        this.angleStart = angleStart;
        this.plane = plane;
    }
    getCurve() {
        var degreesStart = 180 - this.angleStart;
        var degreesEnd = 180 - this.angle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = ((degreesEnd) * Math.PI) / 180;
        return new THREE.EllipseCurve(0, 0, this.radius, this.radius, radiansStart, radiansEnd, this.angle > 0, 0);
    }
    getOffset() {
        const curve = this.getCurve();
        const inCoord = curve.getPoint(0);
        const outCoord = curve.getPoint(1);
        return {
            x: outCoord.x - inCoord.x,
            y: outCoord.y - inCoord.y
        };
    }
}
exports.default = Arc2;
//# sourceMappingURL=arc2.js.map
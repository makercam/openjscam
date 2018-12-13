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
class Arc {
    constructor(offset, angle, plane = constants_1.XZ) {
        this.offset = offset;
        this.angle = angle;
        this.plane = plane;
    }
    getCurveForInCoord(inCoord) {
        if (this.offset.x === undefined) {
            this.offset.x = 0;
        }
        if (this.offset.y === undefined) {
            this.offset.y = 0;
        }
        if (this.offset.z === undefined) {
            this.offset.z = 0;
        }
        if (inCoord.x === undefined || inCoord.y === undefined || inCoord.z === undefined) {
            throw new Error('No valid inCoord given for arc, required coordinates are x, y and z');
        }
        const inCoordVector = new THREE.Vector3(inCoord.x, inCoord.y, inCoord.z);
        const centerCoord = new THREE.Vector3(inCoord.x + this.offset.x, inCoord.y + this.offset.y, inCoord.z + this.offset.z);
        const delta = new THREE.Vector2(this.offset.x, this.offset.y);
        const radius = inCoordVector.distanceTo(centerCoord);
        const angleRadians = delta.angle();
        var degreesStart = 180;
        var degreesEnd = 180 - this.angle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = ((degreesEnd) * Math.PI) / 180;
        return new THREE.EllipseCurve(centerCoord.x, centerCoord.y, radius, radius, radiansStart, radiansEnd, this.angle > 0, angleRadians);
    }
    getOutCoordForInCoord(inCoord) {
        const curve = this.getCurveForInCoord(inCoord);
        if (this.angle === 360) {
            return {
                x: inCoord.x,
                y: inCoord.y,
                z: inCoord.z + (this.offset.z || 0)
            };
        }
        const outCoord = curve.getPoint(1);
        return {
            x: outCoord.x,
            y: outCoord.y,
            z: inCoord.z + (this.offset.z || 0)
        };
    }
}
exports.default = Arc;
//# sourceMappingURL=arc.js.map
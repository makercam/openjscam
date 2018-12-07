"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = __importStar(require("three"));
var Arc = /** @class */ (function () {
    function Arc(offset, angle, plane) {
        this.offset = offset;
        this.angle = angle;
        this.plane = plane;
    }
    Arc.prototype.getOutCoordForInCoord = function (inCoord) {
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
        var inCoordVector = new THREE.Vector3(inCoord.x, inCoord.y, inCoord.z);
        var centerCoord = new THREE.Vector3(inCoord.x + this.offset.x, inCoord.y + this.offset.y, inCoord.z + this.offset.z);
        var delta = new THREE.Vector2(this.offset.x, this.offset.y);
        var radius = inCoordVector.distanceTo(centerCoord);
        var angleRadians = delta.angle();
        var degreesStart = 180;
        var degreesEnd = 180 - this.angle;
        var radiansStart = (degreesStart * Math.PI) / 180;
        var radiansEnd = ((degreesEnd) * Math.PI) / 180;
        var curve = new THREE.EllipseCurve(centerCoord.x, centerCoord.y, radius, radius, radiansStart, radiansEnd, this.angle > 0, angleRadians);
        // curve.getPoints(100).forEach(p => {
        //     const pEl = document.createElement('div')
        //     pEl.style.width = '3px';
        //     pEl.style.height = '3px';
        //     pEl.style.position = 'absolute'
        //     pEl.style.bottom = (p.y * 10) + 400 + 'px'
        //     pEl.style.left = (p.x * 10) + 'px'
        //     pEl.style.background = 'black'
        //     document.body.appendChild(pEl)
        // })
        if (this.angle === 360) {
            return {
                x: inCoord.x,
                y: inCoord.y,
                z: inCoord.z + this.offset.z
            };
        }
        var outCoord = curve.getPoint(1);
        return {
            x: Math.round(outCoord.x * 10000) / 10000,
            y: Math.round(outCoord.y * 10000) / 10000,
            z: inCoord.z + this.offset.z
        };
    };
    return Arc;
}());
exports.default = Arc;

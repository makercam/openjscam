"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const THREE = __importStar(require("three"));
const constants_1 = require("./constants");
const arc_1 = __importDefault(require("./segments/arc"));
const ellipse_1 = __importDefault(require("./segments/ellipse"));
const rotate_1 = __importDefault(require("./transformations/rotate"));
const scale_1 = __importDefault(require("./transformations/scale"));
const translate_1 = __importDefault(require("./transformations/translate"));
const utils_1 = require("./utils");
const arc2_1 = __importDefault(require("./segments/arc2"));
class State {
    constructor(postProcessor) {
        this.postProcessor = postProcessor;
        this.lastCoord = { x: 0, y: 0, z: 0 };
        this.lastUntransformedCoord = { x: 0, y: 0, z: 0 };
        this.transformations = [];
        this.gcode = [];
        this.shapes = [];
    }
    reset() {
        this.tool = undefined;
        this.units = undefined;
        this.feedRate = undefined;
        this.speed = undefined;
        this.lastCoord = { x: 0, y: 0, z: 0 };
        this.lastUntransformedCoord = { x: 0, y: 0, z: 0 };
        this.transformations = [];
        this.gcode = [];
    }
    updateLastCoord(coord) {
        utils_1.axes.forEach(c => {
            if (coord[c] !== undefined) {
                this.lastCoord[c] = coord[c];
            }
        });
    }
    updateLastUntransformedCoord(coord) {
        utils_1.axes.forEach(c => {
            if (coord[c] !== undefined) {
                this.lastUntransformedCoord[c] = coord[c];
            }
        });
    }
    removeRedundantCoords(coord) {
        const newCoord = {};
        utils_1.axes.forEach(axis => {
            if (this.lastCoord[axis] !== coord[axis] && coord[axis] !== undefined) {
                newCoord[axis] = coord[axis];
            }
        });
        if (Object.keys(newCoord).length === 0) {
            return null;
        }
        return newCoord;
    }
    applyTransformations(coordinate, transformations = null) {
        let newCoord = coordinate;
        let transformationsToApply = transformations;
        if (transformationsToApply === null) {
            transformationsToApply = this.transformations;
        }
        transformationsToApply.forEach(transformation => {
            newCoord = this.applyTransformation(newCoord, transformation);
        });
        return newCoord;
    }
    applyTransformation(coord, transformation) {
        let newCoord = {};
        if (transformation instanceof translate_1.default) {
            var translated = new THREE.Vector3(coord.x, coord.y, coord.z);
            translated.add(new THREE.Vector3(transformation.offset.x, transformation.offset.y, transformation.offset.z));
            if (coord.x !== undefined) {
                newCoord.x = translated.x;
            }
            if (coord.y !== undefined) {
                newCoord.y = translated.y;
            }
            if (coord.z !== undefined) {
                newCoord.z = translated.z;
            }
        }
        if (transformation instanceof rotate_1.default) {
            var rotated = new THREE.Vector3(coord.x, coord.y, coord.z);
            rotated.applyAxisAngle(new THREE.Vector3(0, 0, 1), -utils_1.toRadians(transformation.angle));
            newCoord = {
                x: rotated.x,
                y: rotated.y,
                z: rotated.z
            };
        }
        if (transformation instanceof scale_1.default) {
            var scaled = new THREE.Vector3(coord.x, coord.y, coord.z);
            var matrix = new THREE.Matrix4();
            matrix.makeScale(transformation.scales.x || 1, transformation.scales.y || 1, transformation.scales.z || 1);
            scaled.applyMatrix4(matrix);
            newCoord = {
                x: scaled.x,
                y: scaled.y,
                z: scaled.z
            };
        }
        return newCoord;
    }
    setPostProcessor(postProcessor) {
        this.postProcessor = postProcessor;
    }
    setTool(tool) {
        this.tool = tool;
    }
    setUnits(units) {
        this.units = units;
        this.write(this.postProcessor.units(units));
    }
    setFeedRate(feedRate) {
        this.feedRate = feedRate;
        this.write(this.postProcessor.feed(feedRate));
    }
    setSpeed(speed) {
        this.speed = speed;
        this.write(this.postProcessor.speed(speed));
    }
    cut(coordinate) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        const transformedCoord = utils_1.roundCoord(this.applyTransformations(coordinate), 10000);
        const cleanedCoord = this.removeRedundantCoords(transformedCoord);
        if (cleanedCoord === null)
            return;
        this.shapes.push(new THREE.LineCurve3(new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z), new THREE.Vector3(transformedCoord.x || this.lastCoord.x, transformedCoord.y || this.lastCoord.y, transformedCoord.z || this.lastCoord.z)));
        this.write(this.postProcessor.cut(cleanedCoord));
        this.updateLastCoord(transformedCoord);
        this.updateLastUntransformedCoord(coordinate);
    }
    icut(offset) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        const absOffset = utils_1.sumCoords(this.lastUntransformedCoord, offset);
        const transformedOffset = utils_1.roundCoord(this.applyTransformations(absOffset), 10000);
        const cleanedCoord = this.removeRedundantCoords(transformedOffset);
        if (cleanedCoord === null)
            return;
        this.shapes.push(new THREE.LineCurve3(new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z), new THREE.Vector3(transformedOffset.x || this.lastCoord.x, transformedOffset.y || this.lastCoord.y, transformedOffset.z || this.lastCoord.z)));
        this.write(this.postProcessor.cut(cleanedCoord));
        this.updateLastCoord(transformedOffset);
        this.updateLastUntransformedCoord(absOffset);
    }
    rapid(coordinate) {
        const transformedCoord = utils_1.roundCoord(this.applyTransformations(coordinate), 10000);
        const cleanedCoord = this.removeRedundantCoords(transformedCoord);
        if (cleanedCoord === null)
            return;
        const shape = new THREE.LineCurve3(new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z), new THREE.Vector3(transformedCoord.x || this.lastCoord.x, transformedCoord.y || this.lastCoord.y, transformedCoord.z || this.lastCoord.z));
        shape.isRapid = true;
        this.shapes.push(shape);
        this.write(this.postProcessor.rapid(cleanedCoord));
        this.updateLastCoord(transformedCoord);
        this.updateLastUntransformedCoord(coordinate);
    }
    irapid(offset) {
        const absOffset = utils_1.sumCoords(this.lastUntransformedCoord, offset);
        const transformedOffset = utils_1.roundCoord(this.applyTransformations(absOffset), 10000);
        const cleanedCoord = this.removeRedundantCoords(transformedOffset);
        if (cleanedCoord === null)
            return;
        const shape = new THREE.LineCurve3(new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z), new THREE.Vector3(transformedOffset.x || this.lastCoord.x, transformedOffset.y || this.lastCoord.y, transformedOffset.z || this.lastCoord.z));
        shape.isRapid = true;
        this.shapes.push(shape);
        this.write(this.postProcessor.rapid(cleanedCoord));
        this.updateLastCoord(transformedOffset);
        this.updateLastUntransformedCoord(absOffset);
    }
    dwell(duration) {
        this.write(this.postProcessor.dwell(duration));
    }
    arc(offset, angle, plane = constants_1.XZ) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        const transformedOffset = this.applyTransformations(offset, this.transformations.filter(t => { return !(t instanceof translate_1.default); }));
        const arc = new arc_1.default(transformedOffset, angle, plane);
        this.write(this.postProcessor.arc(arc, this.lastCoord));
        const outCoord = arc.getOutCoordForInCoord(this.lastCoord);
        this.shapes.push(arc.getCurveForInCoord(this.lastCoord));
        this.updateLastCoord(utils_1.mergeCoords(this.lastCoord, outCoord));
        const untransformedArc = new arc_1.default(offset, angle, plane);
        const untransformedOutCoord = untransformedArc.getOutCoordForInCoord(this.lastUntransformedCoord);
        this.updateLastUntransformedCoord(utils_1.mergeCoords(this.lastUntransformedCoord, untransformedOutCoord));
    }
    radiusArc(center, radius, startAngle, angle, plane = constants_1.XZ) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        const arc = new arc2_1.default(radius, startAngle, angle, plane);
        const offset = arc.getOffset();
        const absOffset = utils_1.sumCoords(this.lastUntransformedCoord, offset);
        const transformedOffset = this.applyTransformations(absOffset, this.transformations.filter(t => { return !(t instanceof translate_1.default); }));
        this.write(this.postProcessor.arc2(arc, this.lastCoord));
        this.shapes.push(arc.getCurve());
        this.updateLastCoord(utils_1.mergeCoords(this.lastCoord, transformedOffset));
        this.updateLastUntransformedCoord(utils_1.mergeCoords(this.lastUntransformedCoord, absOffset));
    }
    ellipse(radiusX, radiusY, offsetZ = 0, angle, angleStart = 0, points = 50, plane = constants_1.XZ) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        const ellipse = new ellipse_1.default(radiusX, radiusY, offsetZ, angle, angleStart, points, plane);
        const coords = ellipse.getCoords();
        const gcodes = coords.map(coord => this.postProcessor.cut(utils_1.sumCoords(this.lastCoord, coord)));
        this.writeBatch(gcodes);
        const outCoord = utils_1.sumCoords(this.lastCoord, coords[coords.length - 1]);
        this.updateLastCoord(utils_1.mergeCoords(this.lastCoord, outCoord));
    }
    translate(offset, cb = () => { }) {
        const transformation = new translate_1.default(offset);
        this.transformations.unshift(transformation);
        cb();
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
    }
    rotate(angle, cb = () => { }) {
        const transformation = new rotate_1.default(angle);
        this.transformations.unshift(transformation);
        cb();
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
    }
    scale(scales, cb = () => { }) {
        const transformation = new scale_1.default(scales);
        this.transformations.unshift(transformation);
        cb();
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
    }
    write(command) {
        this.gcode.push([command]);
    }
    writeBatch(commands) {
        this.gcode.push(commands);
    }
    save(path) {
        fs_1.default.writeFileSync(path, this.toString());
    }
    log() {
        console.log(this.toString());
    }
    toString() {
        return this.gcode.map(gcodes => gcodes.join('\n')).join('\n');
    }
}
exports.default = State;
//# sourceMappingURL=state.js.map
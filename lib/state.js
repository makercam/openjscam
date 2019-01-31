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
// @ts-ignore
const fs_1 = __importDefault(require("fs"));
const THREE = __importStar(require("three"));
const constants_1 = require("./constants");
const arc_1 = __importDefault(require("./segments/arc"));
const ellipse_1 = __importDefault(require("./segments/ellipse"));
const rotate_1 = __importDefault(require("./transformations/rotate"));
const scale_1 = __importDefault(require("./transformations/scale"));
const utils_1 = require("./utils");
const radiusArc_1 = __importDefault(require("./segments/radiusArc"));
const translate_1 = __importDefault(require("./transformations/translate"));
class State {
    constructor(postProcessor) {
        this.postProcessor = postProcessor;
        this.resolution = 0.1;
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
    applyTransformations(coordinate, transformations = null, isIncremental = false) {
        let newCoord = coordinate;
        let transformationsToApply = transformations;
        if (transformationsToApply === null) {
            transformationsToApply = this.transformations;
        }
        transformationsToApply.forEach(transformation => {
            newCoord = this.applyTransformation(newCoord, transformation, isIncremental);
        });
        return newCoord;
    }
    applyTransformation(coord, transformation, isIncremental = false) {
        let newCoord = {};
        if (transformation instanceof translate_1.default && !isIncremental) {
            var translated = new THREE.Vector3(coord.x, coord.y, coord.z);
            translated.add(new THREE.Vector3(transformation.offset.x || 0, transformation.offset.y || 0, transformation.offset.z || 0));
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
        else if (isIncremental) {
            newCoord = coord;
        }
        if (transformation instanceof rotate_1.default) {
            var rotated = new THREE.Vector3(coord.x === undefined ? this.lastCoord.x : coord.x, coord.y === undefined ? this.lastCoord.y : coord.y, coord.z === undefined ? this.lastCoord.z : coord.z);
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
    setResolution(resolution) {
        this.resolution = resolution;
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
        const fullCoord = this.fillCoordWithLastUntransformedCoord(coordinate);
        const transformedCoord = utils_1.roundCoord(this.applyTransformations(fullCoord), 10000);
        const cleanedCoord = this.removeRedundantCoords(transformedCoord);
        if (cleanedCoord === null)
            return;
        this.shapes.push(new THREE.LineCurve3(new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z), new THREE.Vector3(transformedCoord.x, transformedCoord.y, transformedCoord.z)));
        this.write(this.postProcessor.cut(cleanedCoord));
        this.updateLastCoord(transformedCoord);
        this.updateLastUntransformedCoord(utils_1.mergeCoords(this.lastUntransformedCoord, fullCoord));
    }
    icut(offset) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        const fullOffset = this.fillCoordWithZeros(offset);
        const transformedOffset = utils_1.roundCoord(this.applyTransformations(fullOffset, null, true), 10000);
        const transformedEndCoord = utils_1.sumCoords(this.lastCoord, transformedOffset);
        const cleanedCoord = this.removeRedundantCoords(transformedEndCoord);
        if (cleanedCoord === null)
            return;
        this.shapes.push(new THREE.LineCurve3(new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z), new THREE.Vector3(transformedEndCoord.x, transformedEndCoord.y, transformedEndCoord.z)));
        this.write(this.postProcessor.cut(cleanedCoord));
        this.updateLastCoord(transformedEndCoord);
        this.updateLastUntransformedCoord(utils_1.sumCoords(this.lastUntransformedCoord, fullOffset));
    }
    fillCoordWithLastUntransformedCoord(coordinate) {
        return {
            x: coordinate.x === undefined ? this.lastUntransformedCoord.x : coordinate.x,
            y: coordinate.y === undefined ? this.lastUntransformedCoord.y : coordinate.y,
            z: coordinate.z === undefined ? this.lastUntransformedCoord.z : coordinate.z
        };
    }
    fillCoordWithZeros(coordinate) {
        return {
            x: coordinate.x === undefined ? 0 : coordinate.x,
            y: coordinate.y === undefined ? 0 : coordinate.y,
            z: coordinate.z === undefined ? 0 : coordinate.z
        };
    }
    rapid(coordinate) {
        const fullCoord = this.fillCoordWithLastUntransformedCoord(coordinate);
        const transformedCoord = utils_1.roundCoord(this.applyTransformations(fullCoord), 10000);
        const cleanedCoord = this.removeRedundantCoords(transformedCoord);
        if (cleanedCoord === null)
            return;
        const shape = new THREE.LineCurve3(new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z), new THREE.Vector3(transformedCoord.x, transformedCoord.y, transformedCoord.z));
        // @ts-ignore
        shape.isRapid = true;
        this.shapes.push(shape);
        this.write(this.postProcessor.rapid(cleanedCoord));
        this.updateLastCoord(transformedCoord);
    }
    irapid(offset) {
        const fullOffset = this.fillCoordWithZeros(offset);
        const transformedOffset = utils_1.roundCoord(this.applyTransformations(fullOffset, null, true), 10000);
        const endCoord = utils_1.sumCoords(this.lastCoord, transformedOffset);
        const cleanedCoord = this.removeRedundantCoords(endCoord);
        if (cleanedCoord === null)
            return;
        const shape = new THREE.LineCurve3(new THREE.Vector3(this.lastCoord.x, this.lastCoord.y, this.lastCoord.z), new THREE.Vector3(endCoord.x, endCoord.y, endCoord.z));
        // @ts-ignore
        shape.isRapid = true;
        this.shapes.push(shape);
        this.write(this.postProcessor.rapid(cleanedCoord));
        this.updateLastCoord(endCoord);
    }
    dwell(duration) {
        this.write(this.postProcessor.dwell(duration));
    }
    hasTransformation(transformationType) {
        // @ts-ignore
        return this.transformations.filter(t => t instanceof transformationType)
            .length > 0;
    }
    arc(centerOffset, angle, plane = constants_1.XY) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        if (this.hasTransformation(scale_1.default)) {
            const a = centerOffset.x || 0;
            const b = centerOffset.y || 0;
            const radius = Math.sqrt(a * a + b * b);
            const angleStart = (Math.atan2(0 - a, 0 - b) * 180 / Math.PI);
            return this.ellipse(radius, radius, 0, angleStart + angle, angleStart);
        }
        const transformedOffset = utils_1.roundCoord(this.applyTransformations(this.fillCoordWithZeros(centerOffset), null, true));
        const transformedArc = new arc_1.default(transformedOffset, angle, plane);
        const transformedEndOffset = transformedArc.getOffset();
        const absEndOffset = utils_1.sumCoords(this.lastCoord, transformedEndOffset);
        this.write(this.postProcessor.arc(absEndOffset, transformedOffset, angle > 0));
        const curve = transformedArc.getCurveForInCoord(this.lastCoord);
        this.shapes.push(curve);
        this.updateLastCoord(absEndOffset);
    }
    radiusArc(radius, startAngle, endAngle, plane = constants_1.XY) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        if (this.hasTransformation(scale_1.default)) {
            return this.ellipse(radius, radius, 0, endAngle, startAngle);
        }
        this.transformations.forEach(t => {
            if (t instanceof rotate_1.default) {
                startAngle += t.angle;
                endAngle += t.angle;
            }
        });
        const transformedArc = new radiusArc_1.default(radius, startAngle, endAngle, plane);
        const transformedEndOffset = transformedArc.getOffset();
        const transformedCenterOffset = transformedArc.getCenterOffset();
        const absEndOffset = utils_1.sumCoords(this.lastCoord, transformedEndOffset);
        this.write(this.postProcessor.arc(absEndOffset, transformedCenterOffset, startAngle < endAngle));
        const curve = transformedArc.getCurveForInCoord(this.lastCoord);
        this.shapes.push(curve);
        this.updateLastCoord(utils_1.roundCoord(utils_1.mergeCoords(this.lastCoord, absEndOffset)));
    }
    ellipse(radiusX, radiusY, offsetZ = 0, angle, angleStart = 0, points, plane = constants_1.XY) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        this.transformations.forEach(t => {
            if (t instanceof rotate_1.default) {
                angle += t.angle;
                angleStart += t.angle;
            }
            if (t instanceof scale_1.default) {
                radiusX = radiusX * (t.scales.x || 1);
                radiusY = radiusY * (t.scales.y || 1);
                offsetZ = offsetZ * (t.scales.z || 1);
            }
        });
        const ellipse = new ellipse_1.default(radiusX, radiusY, offsetZ, angle, angleStart, plane);
        if (!points) {
            const length = ellipse.curve.getLength();
            points = length / this.resolution;
            if (points < 3) {
                points = 2;
            }
        }
        const coords = ellipse.getCoords(points);
        const gcodes = coords.map(coord => {
            const absCoord = utils_1.sumCoords(this.lastCoord, coord);
            const cleanedCoord = this.removeRedundantCoords(absCoord);
            return this.postProcessor.cut(cleanedCoord === null ? absCoord : cleanedCoord);
        });
        this.writeBatch(gcodes);
        const absCoord = utils_1.sumCoords(this.lastCoord, coords[coords.length - 1]);
        this.shapes.push(ellipse.getCurveForInCoord(this.lastCoord));
        this.updateLastCoord(absCoord);
    }
    rotate(angle, cb = () => { }) {
        const transformation = new rotate_1.default(angle);
        this.transformations.unshift(transformation);
        cb();
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
        this.lastUntransformedCoord = {
            x: this.lastCoord.x,
            y: this.lastCoord.y,
            z: this.lastCoord.z,
        };
    }
    scale(scales, cb = () => { }) {
        const transformation = new scale_1.default(typeof scales === 'number' ? { x: scales, y: scales, z: scales } : scales);
        this.transformations.unshift(transformation);
        cb();
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
        this.lastUntransformedCoord = {
            x: this.lastCoord.x,
            y: this.lastCoord.y,
            z: this.lastCoord.z,
        };
    }
    translate(offset, cb = () => { }) {
        const transformation = new translate_1.default(offset);
        this.transformations.unshift(transformation);
        cb();
        this.transformations.splice(this.transformations.indexOf(transformation), 1);
        this.lastUntransformedCoord = {
            x: this.lastCoord.x,
            y: this.lastCoord.y,
            z: this.lastCoord.z,
        };
    }
    write(command) {
        // helpfull for debugging
        // console.log(command)
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
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
var fs_1 = __importDefault(require("fs"));
var THREE = __importStar(require("three"));
var constants_1 = require("./constants");
var arc_1 = __importDefault(require("./segments/arc"));
var dwell_1 = __importDefault(require("./segments/dwell"));
var feed_1 = __importDefault(require("./segments/feed"));
var linear_1 = __importDefault(require("./segments/linear"));
var rapid_1 = __importDefault(require("./segments/rapid"));
var rotate_1 = __importDefault(require("./segments/rotate"));
var speed_1 = __importDefault(require("./segments/speed"));
var translate_1 = __importDefault(require("./segments/translate"));
var units_1 = __importDefault(require("./segments/units"));
var utils_1 = require("./utils");
var GcodeGenerator = /** @class */ (function () {
    function GcodeGenerator() {
        this.gcode = [];
        this.lastCoord = { x: 0, y: 0, z: 0 };
    }
    GcodeGenerator.prototype.updateLastCoord = function (coord) {
        var _this = this;
        utils_1.axes.forEach(function (c) {
            if (coord[c] !== undefined) {
                _this.lastCoord[c] = coord[c];
            }
        });
    };
    GcodeGenerator.prototype.applyTransformation = function (coord, transformation) {
        var newCoord = {};
        if (transformation instanceof translate_1.default) {
            var translated = new THREE.Vector3(coord.x, coord.y, coord.z);
            translated.add(new THREE.Vector3(transformation.offset.x, transformation.offset.y, transformation.offset.z));
            newCoord = {
                x: Math.round(translated.x * 1000) / 1000,
                y: Math.round(translated.y * 1000) / 1000,
                z: Math.round(translated.z * 1000) / 1000
            };
        }
        if (transformation instanceof rotate_1.default) {
            var rotated = new THREE.Vector3(coord.x, coord.y, coord.z);
            rotated.applyAxisAngle(new THREE.Vector3(0, 0, 1), -utils_1.toRadians(transformation.angle));
            newCoord = {
                x: Math.round(rotated.x * 1000) / 1000,
                y: Math.round(rotated.y * 1000) / 1000,
                z: Math.round(rotated.z * 1000) / 1000
            };
        }
        return newCoord;
    };
    GcodeGenerator.prototype.toAbsolute = function (segments) {
        var lastCoord = { x: 0, y: 0, z: 0 };
        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
            var segment = segments_1[_i];
            if (segment instanceof linear_1.default || segment instanceof rapid_1.default) {
                if (segment.incremental === true) {
                    segment.outCoord = utils_1.sumCoords(lastCoord, segment.outCoord);
                    segment.incremental = false;
                }
                lastCoord = utils_1.mergeCoords(lastCoord, segment.outCoord);
            }
            if (segment instanceof arc_1.default) {
                var outCoord = segment.getOutCoordForInCoord(lastCoord);
                lastCoord = utils_1.mergeCoords(lastCoord, outCoord);
            }
        }
        return segments;
    };
    GcodeGenerator.prototype.generate = function (segments, transformations) {
        if (transformations === void 0) { transformations = []; }
        var absoluteSegments = this.toAbsolute(segments);
        for (var _i = 0, transformations_1 = transformations; _i < transformations_1.length; _i++) {
            var transformation = transformations_1[_i];
            for (var _a = 0, absoluteSegments_1 = absoluteSegments; _a < absoluteSegments_1.length; _a++) {
                var segment = absoluteSegments_1[_a];
                if (segment instanceof linear_1.default || segment instanceof rapid_1.default) {
                    segment.outCoord = this.applyTransformation(segment.outCoord, transformation);
                }
                if (segment instanceof arc_1.default && transformation instanceof rotate_1.default) {
                    segment.offset = this.applyTransformation(segment.offset, transformation);
                }
            }
        }
        for (var _b = 0, absoluteSegments_2 = absoluteSegments; _b < absoluteSegments_2.length; _b++) {
            var segment = absoluteSegments_2[_b];
            if (segment instanceof dwell_1.default) {
                this.debug("dwell(" + segment.duration + ")");
                this.dwell(segment.duration);
            }
            else if (segment instanceof units_1.default) {
                this.debug("units(" + segment.units + ")");
                this.units(segment.units);
            }
            else if (segment instanceof speed_1.default) {
                this.debug("speed(" + segment.speed + ")");
                this.speed(segment.speed);
            }
            else if (segment instanceof feed_1.default) {
                this.debug("feed(" + segment.feedRate + ")");
                this.feed(segment.feedRate);
            }
            else if (segment instanceof linear_1.default) {
                this.debug("linear(" + JSON.stringify(segment.outCoord) + ")");
                this.moveLinearToCoord(segment.outCoord);
                this.updateLastCoord(segment.outCoord);
            }
            else if (segment instanceof rapid_1.default) {
                this.debug("rapid(" + JSON.stringify(segment.outCoord) + ")");
                this.moveRapidToCoord(segment.outCoord);
                this.updateLastCoord(segment.outCoord);
            }
            else if (segment instanceof arc_1.default) {
                this.debug("arc(" + JSON.stringify(segment.offset) + ", " + segment.angle + ")");
                var outCoord = segment.getOutCoordForInCoord(this.lastCoord);
                this.arc(segment);
                this.updateLastCoord(outCoord);
            }
            else if (segment instanceof translate_1.default) {
                this.debug("translate(" + JSON.stringify(segment.offset) + ")");
                this.generate(segment.segments, transformations.concat([segment]));
            }
            else if (segment instanceof rotate_1.default) {
                this.debug("rotate(" + segment.angle + ")");
                this.generate(segment.segments, transformations.concat([segment]));
            }
        }
        return this;
    };
    GcodeGenerator.prototype.write = function (command) {
        this.gcode.push(command);
    };
    GcodeGenerator.prototype.debug = function (comment) {
        if (process.env.DEBUG) {
            this.gcode.push("(" + comment + ")");
        }
    };
    GcodeGenerator.prototype.retract = function (height) {
        this.write("G1 Z" + height);
    };
    GcodeGenerator.prototype.dwell = function (duration) {
        this.write("G4 P" + duration);
    };
    GcodeGenerator.prototype.feed = function (feedRate) {
        this.write("F" + feedRate);
    };
    GcodeGenerator.prototype.speed = function (speed) {
        this.write("M3 S" + speed);
    };
    GcodeGenerator.prototype.units = function (units) {
        this.write(units === constants_1.IMPERIAL ? 'G20' : 'G21');
    };
    GcodeGenerator.prototype.moveRapidToCoord = function (coord) {
        this.write("G0" + (coord.x !== undefined && coord.x !== null ? " X" + coord.x : '') + (coord.y !== undefined && coord.y !== null ? " Y" + coord.y : '') + (coord.z !== undefined && coord.z !== null ? " Z" + coord.z : ''));
    };
    GcodeGenerator.prototype.moveLinearToCoord = function (coord) {
        this.write("G1" + (coord.x !== undefined && coord.x !== null ? " X" + coord.x : '') + (coord.y !== undefined && coord.y !== null ? " Y" + coord.y : '') + (coord.z !== undefined && coord.z !== null ? " Z" + coord.z : ''));
    };
    GcodeGenerator.prototype.arc = function (arc) {
        var outCoord = arc.getOutCoordForInCoord(this.lastCoord);
        var centerCoord = {
            x: this.lastCoord.x + arc.offset.x,
            y: this.lastCoord.y + arc.offset.y,
        };
        var i = Math.round((centerCoord.x - this.lastCoord.x) * 10000) / 10000;
        var j = Math.round((centerCoord.y - this.lastCoord.y) * 10000) / 10000;
        this.write((arc.angle > 0 ? 'G2' : 'G3') + " X" + outCoord.x + " Y" + outCoord.y + " I" + i + " J" + j + (outCoord.z !== undefined ? " Z" + outCoord.z : ''));
    };
    GcodeGenerator.prototype.save = function (path) {
        fs_1.default.writeFileSync(path, this.toString());
    };
    GcodeGenerator.prototype.toString = function () {
        return this.gcode.join('\n');
    };
    return GcodeGenerator;
}());
exports.default = GcodeGenerator;

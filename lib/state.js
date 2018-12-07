"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
var State = /** @class */ (function () {
    function State() {
        this.segments = [];
    }
    State.prototype.setTool = function (tool) {
        this.tool = tool;
    };
    State.prototype.setUnits = function (units) {
        this.units = units;
        this.segments.push(new units_1.default(units));
    };
    State.prototype.setFeedRate = function (feedRate) {
        this.feedRate = feedRate;
        this.segments.push(new feed_1.default(feedRate));
    };
    State.prototype.setSpeed = function (speed) {
        this.speed = speed;
        this.segments.push(new speed_1.default(speed));
    };
    State.prototype.cut = function (coordinate) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        this.segments.push(new linear_1.default(coordinate));
    };
    State.prototype.rapid = function (coordinate) {
        this.segments.push(new rapid_1.default(coordinate));
    };
    State.prototype.icut = function (coordinate) {
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        this.segments.push(new linear_1.default(coordinate, true));
    };
    State.prototype.irapid = function (coordinate) {
        this.segments.push(new rapid_1.default(coordinate, true));
    };
    State.prototype.dwell = function (duration) {
        this.segments.push(new dwell_1.default(duration));
    };
    State.prototype.arc = function (offset, angle, plane) {
        if (plane === void 0) { plane = constants_1.XZ; }
        if (!this.feedRate) {
            throw new Error('No feedrate given, please call `feed()` before cut');
        }
        this.segments.push(new arc_1.default(offset, angle, plane));
    };
    State.prototype.translate = function (offset, cb) {
        if (cb === void 0) { cb = function () { }; }
        var lastSegments = this.segments;
        this.segments = [];
        cb();
        var segmentsToTranslate = this.segments;
        this.segments = lastSegments;
        this.segments.push(new translate_1.default(segmentsToTranslate, offset));
    };
    State.prototype.rotate = function (angle, cb) {
        if (cb === void 0) { cb = function () { }; }
        var lastSegments = this.segments;
        this.segments = [];
        cb();
        var segmentsToTranslate = this.segments;
        this.segments = lastSegments;
        this.segments.push(new rotate_1.default(segmentsToTranslate, angle));
    };
    return State;
}());
exports.default = State;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./index.d.ts" />
require("three");
const gcode_1 = __importDefault(require("./postprocessors/gcode"));
const state_1 = __importDefault(require("./state"));
var constants_1 = require("./constants");
exports.IMPERIAL = constants_1.IMPERIAL;
exports.METRIC = constants_1.METRIC;
const postProcessor = new gcode_1.default();
exports.state = new state_1.default(postProcessor);
exports.units = exports.state.setUnits.bind(exports.state);
exports.tool = exports.state.setTool.bind(exports.state);
exports.feed = exports.state.setFeedRate.bind(exports.state);
exports.speed = exports.state.setSpeed.bind(exports.state);
exports.cut = exports.state.cut.bind(exports.state);
exports.icut = exports.state.icut.bind(exports.state);
exports.rapid = exports.state.rapid.bind(exports.state);
exports.irapid = exports.state.irapid.bind(exports.state);
exports.dwell = exports.state.dwell.bind(exports.state);
exports.translate = exports.state.translate.bind(exports.state);
exports.rotate = exports.state.rotate.bind(exports.state);
exports.scale = exports.state.scale.bind(exports.state);
exports.arc = exports.state.arc.bind(exports.state);
exports.ellipse = exports.state.ellipse.bind(exports.state);
exports.save = exports.state.save.bind(exports.state);
exports.log = exports.state.log.bind(exports.state);
exports.reset = exports.state.reset.bind(exports.state);
function gcode() {
    return exports.state.gcode;
}
exports.gcode = gcode;
//# sourceMappingURL=index.js.map
"use strict";
/// <reference path="./index.d.ts" />
// import 'three'
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gcode_1 = __importDefault(require("./postprocessors/gcode"));
const state_1 = __importDefault(require("./state"));
const viewer_1 = __importDefault(require("./viewer"));
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
exports.radiusArc = exports.state.radiusArc.bind(exports.state);
exports.ellipse = exports.state.ellipse.bind(exports.state);
exports.save = exports.state.save.bind(exports.state);
exports.log = exports.state.log.bind(exports.state);
exports.reset = exports.state.reset.bind(exports.state);
function gcode() {
    return exports.state.gcode;
}
exports.gcode = gcode;
function helix(radius, depth, depthPerCut, zSafe) {
    exports.irapid({ x: -radius });
    const totalArcs = Math.ceil(depth / depthPerCut);
    for (var i = 0; i < totalArcs; i++) {
        let cutDepth = depthPerCut;
        if (i + 1 === totalArcs) {
            cutDepth = depth - (depthPerCut * i);
        }
        exports.arc({ x: radius, z: -cutDepth }, 360);
    }
    exports.arc({ x: radius }, 360);
    exports.rapid({ z: zSafe });
    exports.irapid({ x: radius });
}
exports.helix = helix;
function drill(depth, depthPerCut, zSafe) {
    const totalCuts = Math.ceil(depth / depthPerCut);
    for (var i = 1; i <= totalCuts; i++) {
        let cutDepth = depthPerCut * i;
        if (cutDepth > depth) {
            cutDepth = depth;
        }
        exports.cut({ z: -cutDepth });
        exports.rapid({ z: zSafe });
    }
}
exports.drill = drill;
function view(containerEl) {
    viewer_1.default(exports.state, containerEl);
}
exports.view = view;
//# sourceMappingURL=index.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var generator_1 = __importDefault(require("./generator"));
var state_1 = __importDefault(require("./state"));
exports.state = new state_1.default();
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
exports.arc = exports.state.arc.bind(exports.state);
function save(path) {
    var generator = new generator_1.default();
    generator.generate(exports.state.segments);
    generator.save(path);
}
exports.save = save;
function log() {
    var generator = new generator_1.default();
    generator.generate(exports.state.segments);
    console.log(generator.toString());
}
exports.log = log;
function gcode() {
    var generator = new generator_1.default();
    generator.generate(exports.state.segments);
    return generator.gcode;
}
exports.gcode = gcode;
exports.IMPERIAL = constants_1.IMPERIAL;
exports.METRIC = constants_1.METRIC;
var openjscam = {
    METRIC: constants_1.METRIC,
    IMPERIAL: constants_1.IMPERIAL,
    state: exports.state,
    units: exports.units,
    tool: exports.tool,
    feed: exports.feed,
    speed: exports.speed,
    cut: exports.cut,
    icut: exports.icut,
    rapid: exports.rapid,
    irapid: exports.irapid,
    dwell: exports.dwell,
    translate: exports.translate,
    rotate: exports.rotate,
    arc: exports.arc,
    log: log,
    save: save,
    gcode: gcode
};
if (typeof window !== 'undefined') {
    window.openjscam = openjscam;
}

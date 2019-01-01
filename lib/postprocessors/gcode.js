"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const utils_1 = require("../utils");
class GcodePostProcessor {
    write(command) {
        return command;
    }
    dwell(duration) {
        return `G4 P${duration}`;
    }
    feed(feedRate) {
        return `F${feedRate}`;
    }
    speed(speed) {
        return `M3 S${speed}`;
    }
    units(units) {
        return units === constants_1.IMPERIAL ? 'G20' : 'G21';
    }
    rapid(coord) {
        return `G0 ${utils_1.coordToString(coord)}`;
    }
    cut(coord) {
        return `G1 ${utils_1.coordToString(coord)}`;
    }
    arc(endOffset, centerOffset, cw) {
        return `${cw ? 'G2' : 'G3'} ${utils_1.coordToString(endOffset)} I${utils_1.round(centerOffset.x || 0)} J${utils_1.round(centerOffset.y || 0)}`;
    }
}
exports.default = GcodePostProcessor;
//# sourceMappingURL=gcode.js.map
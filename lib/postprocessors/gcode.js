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
    arc(arc, lastCoord) {
        const outCoord = arc.getOutCoordForInCoord(lastCoord);
        const centerCoord = {
            x: lastCoord.x + (arc.offset.x || 0),
            y: lastCoord.y + (arc.offset.y || 0),
        };
        const i = utils_1.round(centerCoord.x - lastCoord.x);
        const j = utils_1.round(centerCoord.y - lastCoord.y);
        return `${arc.angle > 0 ? 'G2' : 'G3'} ${utils_1.coordToString(outCoord)} I${i} J${j}`;
    }
}
exports.default = GcodePostProcessor;
//# sourceMappingURL=gcode.js.map
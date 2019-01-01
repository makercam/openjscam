"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axes = ['x', 'y', 'z', 'a', 'b', 'c', 'u', 'v', 'w'];
function sumCoords(coord1, coord2) {
    const newCoord = {};
    exports.axes.forEach((axis) => {
        const coord1AxisValue = coord1[axis];
        const coord2AxisValue = coord2[axis];
        if (coord1AxisValue !== undefined) {
            newCoord[axis] = coord1AxisValue;
        }
        if (coord1AxisValue !== undefined && coord2AxisValue !== undefined) {
            newCoord[axis] = coord1AxisValue + coord2AxisValue;
        }
    });
    return newCoord;
}
exports.sumCoords = sumCoords;
function toRadians(angle) {
    return angle * (Math.PI / 180);
}
exports.toRadians = toRadians;
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}
exports.toDegrees = toDegrees;
function findCoordOnCircle(radius, angle, offset) {
    var newX = radius * Math.cos(toRadians(-angle)) + offset.x;
    var newY = radius * Math.sin(toRadians(-angle)) + offset.y;
    return {
        x: Math.round((newX * 1000)) / 1000,
        y: Math.round((newY * 1000)) / 1000
    };
}
exports.findCoordOnCircle = findCoordOnCircle;
function mergeCoords(coord1, coord2) {
    const newCoord = {};
    exports.axes.forEach(c => {
        if (coord1[c] !== undefined) {
            newCoord[c] = coord1[c];
        }
        if (coord2[c] !== undefined) {
            newCoord[c] = coord2[c];
        }
    });
    return newCoord;
}
exports.mergeCoords = mergeCoords;
function round(number, precision = 10000) {
    return Math.round(number * precision) / precision;
}
exports.round = round;
function roundCoord(coord, precision = 10000) {
    const newCoord = {};
    exports.axes.forEach(axis => {
        const value = coord[axis];
        if (value !== undefined) {
            newCoord[axis] = round(value, precision);
        }
    });
    return newCoord;
}
exports.roundCoord = roundCoord;
function mirrorCoord(coord) {
    const newCoord = {};
    exports.axes.forEach(axis => {
        const axisValue = coord[axis];
        if (axisValue !== undefined) {
            newCoord[axis] = axisValue > 0 ? -axisValue : Math.abs(axisValue);
        }
    });
    return newCoord;
}
exports.mirrorCoord = mirrorCoord;
function coordToString(coord) {
    let str = '';
    exports.axes.forEach((axis) => {
        const value = coord[axis];
        if (value !== undefined) {
            str += `${str.length === 0 ? '' : ' '}${axis.toUpperCase()}${round(value)}`;
        }
    });
    return str;
}
exports.coordToString = coordToString;
//# sourceMappingURL=utils.js.map
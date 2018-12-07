"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axes = ['x', 'y', 'z', 'a', 'b', 'c', 'u', 'v', 'w'];
function sumCoords(coord1, coord2) {
    var newCoord = {};
    exports.axes.forEach(function (c) {
        if (coord1[c] !== undefined) {
            newCoord[c] = coord1[c];
        }
        if (coord1[c] !== undefined && coord2[c] !== undefined) {
            newCoord[c] = coord1[c] + coord2[c];
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
    var newCoord = {};
    exports.axes.forEach(function (c) {
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

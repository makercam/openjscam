"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const maker = __importStar(require("makerjs"));
const sax = __importStar(require("sax"));
const shape2path = __importStar(require("shape2path"));
const make = Object.assign({}, (Object.keys(maker.models).reduce((memo, modelName) => {
    const lcFirstModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    memo[lcFirstModelName] = (...args) => new maker.models[modelName](...args);
    return memo;
}, {})), (Object.keys(maker.model).reduce((memo, modelName) => {
    memo[modelName] = (...args) => new maker.model[modelName](...args);
    return memo;
}, {})), { union: maker.model.combineUnion, difference: maker.model.combineSubtraction, intersection: maker.model.combineIntersection, raster: (modelToRasterize, margin, offset = 0) => {
        var measurement = maker.measure.modelExtents(modelToRasterize);
        var line = new maker.paths.Line([-1, 0], [measurement.width + 1, 0]);
        var count = measurement.height / margin + 1;
        var lines = maker.layout.cloneToColumn(line, count, margin);
        lines.origin = maker.point.subtract(measurement.low, [1.00102, 1.00102]);
        if (offset) {
            maker.model.moveRelative(lines, [0, offset]);
        }
        var clone = maker.cloneObject(modelToRasterize);
        maker.model.combine(clone, lines, true, true, true, true, {
            pointMatchingDistance: .01,
        });
        Object.values(lines.paths).forEach((path, i) => {
            if (i % 2 === 0) {
                const originalOrigin = path.origin;
                path.origin = path.end;
                path.end = originalOrigin;
            }
        });
        return lines;
    }, offset: (modelToOutline, offset, joints = 0) => {
        return maker.model.outline(modelToOutline, Math.abs(offset), joints, offset < 0);
    }, toPoints(drawing, tolerance = 0.1) {
        var chain = maker.model.findSingleChain(drawing);
        var minimumSpacing = tolerance;
        var divisions = Math.floor(chain.pathLength / minimumSpacing);
        var spacing = chain.pathLength / divisions;
        var points = maker.chain.toPoints(chain, spacing);
        return points;
    },
    toKeyPoints(drawing, tolerance = 0.1) {
        var chain = maker.model.findSingleChain(drawing);
        var minimumSpacing = tolerance;
        var divisions = Math.floor(chain.pathLength / minimumSpacing);
        var spacing = chain.pathLength / divisions;
        var keyPoints = maker.chain.toKeyPoints(chain, spacing);
        return keyPoints;
    },
    fromSvg(svg) {
        const parser = sax.parser(false, { trim: true, lowercase: false, position: true });
        parser.onerror = (e) => console.log('error: line ' + e.line + ', column ' + e.column + ', bad character [' + e.c + ']');
        const models = {};
        const counts = {
            ellipses: 0,
            rectangles: 0,
            circles: 0,
            lines: 0,
            paths: 0
        };
        parser.onopentag = function (node) {
            switch (node.name) {
                case 'ELLIPSE':
                    models['ellipse_' + counts.ellipses] = maker.importer.fromSVGPathData(shape2path.ellipse({
                        cx: Number(node.attributes.CX),
                        cy: Number(node.attributes.CY),
                        rx: Number(node.attributes.RX),
                        ry: Number(node.attributes.RY),
                    }));
                    counts.ellipses++;
                    break;
                case 'CIRCLE':
                    models['circle_' + counts.circles] = maker.importer.fromSVGPathData(shape2path.circle({
                        cx: Number(node.attributes.CX),
                        cy: Number(node.attributes.CY),
                        r: Number(node.attributes.R)
                    }));
                    counts.circles++;
                    break;
                case 'RECT':
                    models['rect_' + counts.rectangles] = maker.importer.fromSVGPathData(shape2path.rect({
                        x: Number(node.attributes.X),
                        y: Number(node.attributes.Y),
                        width: Number(node.attributes.WIDTH),
                        height: Number(node.attributes.HEIGHT),
                    }));
                    counts.rectangles++;
                    break;
                case 'LINE':
                    models['line_' + counts.lines] = maker.importer.fromSVGPathData(shape2path.line({
                        x1: Number(node.attributes.X1),
                        x2: Number(node.attributes.X2),
                        y1: Number(node.attributes.Y1),
                        y2: Number(node.attributes.Y2),
                    }));
                    counts.lines++;
                    break;
                case 'PATH':
                    models['path_' + counts.paths] = maker.importer.fromSVGPathData(node.attributes.D);
                    counts.paths++;
                    break;
            }
        };
        parser.write(svg).close();
        return {
            models
        };
    } });
exports.default = make;
//# sourceMappingURL=make.js.map
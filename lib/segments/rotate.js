"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var segment_1 = __importDefault(require("./segment"));
var Rotate = /** @class */ (function (_super) {
    __extends(Rotate, _super);
    function Rotate(segments, angle) {
        var _this = _super.call(this) || this;
        _this.segments = segments;
        _this.angle = angle;
        return _this;
    }
    return Rotate;
}(segment_1.default));
exports.default = Rotate;

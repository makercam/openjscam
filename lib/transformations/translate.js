"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transformation_1 = __importDefault(require("./transformation"));
class Translate extends transformation_1.default {
    constructor(offset) {
        super();
        this.offset = offset;
    }
}
exports.default = Translate;
//# sourceMappingURL=translate.js.map
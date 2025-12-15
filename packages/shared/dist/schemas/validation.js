"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajv = void 0;
exports.validateOrThrow = validateOrThrow;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const api_error_js_1 = require("../errors/api-error.js");
const ajv = new ajv_1.default({ allErrors: true });
exports.ajv = ajv;
(0, ajv_formats_1.default)(ajv);
function validateOrThrow(schema, data) {
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (!valid) {
        throw new api_error_js_1.ApiError(api_error_js_1.ErrorCode.VALIDATION_ERROR, 'Schema validation failed', validate.errors);
    }
}
//# sourceMappingURL=validation.js.map
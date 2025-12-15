"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ErrorCode["CONFLICT"] = "CONFLICT";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class ApiError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.statusCode = this.getStatusCode(code);
        Object.setPrototypeOf(this, ApiError.prototype);
    }
    getStatusCode(code) {
        switch (code) {
            case ErrorCode.UNAUTHORIZED: return 401;
            case ErrorCode.FORBIDDEN: return 403;
            case ErrorCode.NOT_FOUND: return 404;
            case ErrorCode.VALIDATION_ERROR: return 400;
            case ErrorCode.CONFLICT: return 409;
            case ErrorCode.INTERNAL_ERROR:
            default: return 500;
        }
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=api-error.js.map
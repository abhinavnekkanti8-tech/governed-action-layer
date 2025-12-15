export enum ErrorCode {
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    CONFLICT = 'CONFLICT',
}

export class ApiError extends Error {
    public readonly code: ErrorCode;
    public readonly statusCode: number;
    public readonly details?: any;

    constructor(code: ErrorCode, message: string, details?: any) {
        super(message);
        this.code = code;
        this.details = details;
        this.statusCode = this.getStatusCode(code);
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    private getStatusCode(code: ErrorCode): number {
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

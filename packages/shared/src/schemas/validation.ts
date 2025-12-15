import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { ApiError, ErrorCode } from '../errors/api-error.js';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export function validateOrThrow(schema: object, data: any) {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
        throw new ApiError(
            ErrorCode.VALIDATION_ERROR,
            'Schema validation failed',
            validate.errors
        );
    }
}

// Re-export AJV instance if needed for caching compilation
export { ajv };

import Ajv from 'ajv';
declare const ajv: Ajv;
export declare function validateOrThrow(schema: object, data: any): void;
export { ajv };

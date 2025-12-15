"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Redactor = void 0;
class Redactor {
    static SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'auth', 'authorization', 'credit_card'];
    static redact(data) {
        if (!data)
            return data;
        if (typeof data !== 'object')
            return data;
        if (Array.isArray(data)) {
            return data.map(Redactor.redact);
        }
        const redacted = { ...data };
        for (const key of Object.keys(redacted)) {
            const lowerKey = key.toLowerCase();
            if (Redactor.SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
                redacted[key] = '[REDACTED]';
            }
            else if (typeof redacted[key] === 'object') {
                redacted[key] = Redactor.redact(redacted[key]);
            }
        }
        return redacted;
    }
}
exports.Redactor = Redactor;
//# sourceMappingURL=redactor.js.map
export class Redactor {
    private static SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'auth', 'authorization', 'credit_card'];

    static redact(data: any): any {
        if (!data) return data;
        if (typeof data !== 'object') return data;

        if (Array.isArray(data)) {
            return data.map(Redactor.redact);
        }

        const redacted: any = { ...data };

        for (const key of Object.keys(redacted)) {
            const lowerKey = key.toLowerCase();
            if (Redactor.SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
                redacted[key] = '[REDACTED]';
            } else if (typeof redacted[key] === 'object') {
                redacted[key] = Redactor.redact(redacted[key]);
            }
        }

        return redacted;
    }
}

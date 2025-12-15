"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const database_1 = require("@governed-action-layer/database");
const redactor_js_1 = require("./redactor.js");
class AuditService {
    static async log(principal, eventType, details, resourceId) {
        const redactedDetails = redactor_js_1.Redactor.redact(details);
        await database_1.prisma.auditEvent.create({
            data: {
                tenantId: principal.tenantId,
                actorId: principal.id,
                actorType: principal.type, // 'USER' | 'APP' | 'AGENT' - matches DB enum? Need to check case sensitivity or mapping
                eventType,
                resourceId,
                details: redactedDetails || {},
            },
        });
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit-service.js.map
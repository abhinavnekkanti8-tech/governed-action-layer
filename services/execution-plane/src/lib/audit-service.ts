import { prisma, Principal } from '@governed-action-layer/database';
import { Redactor } from './redactor.js';

export class AuditService {
    static async log(
        principal: Principal,
        eventType: string,
        details?: any,
        resourceId?: string
    ) {
        const redactedDetails = Redactor.redact(details);

        await prisma.auditEvent.create({
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

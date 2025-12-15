export interface AuditEvent {
    id: string;
    tenantId: string;
    timestamp: string;
    eventType: string;
    actorId: string;
    actorType: 'user' | 'app' | 'agent';
    resourceId?: string;
    details?: Record<string, any>;
    metadata?: Record<string, any>;
}

export interface AuditEvent {
    id: string;
    tenantId: string;
    timestamp: string;
    eventType: string; // 'run_started', 'step_completed', 'approval_decision', etc.
    actorId: string; // Principal ID
    actorType: 'user' | 'app' | 'agent';
    resourceId?: string; // run_id, workflow_id, etc.
    details?: Record<string, any>; // Redacted payload
    metadata?: Record<string, any>; // Context (IP, etc.)
}

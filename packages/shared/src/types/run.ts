export type RunStatus = 'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'cancelled';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Run {
    id: string;
    tenantId: string;
    skillId: string;
    skillVersion: string;
    invokerId: string;
    invokerType: 'user' | 'app' | 'agent';
    status: RunStatus;
    input: any; // Redacted if sensitive
    output?: any; // Redacted if sensitive
    error?: string;
    startedAt: string;
    completedAt?: string;
}

export interface StepTrace {
    id: string;
    runId: string;
    stepId: string; // Node ID
    stepType: string;
    status: 'running' | 'completed' | 'failed';
    input?: any;
    output?: any;
    startedAt: string;
    completedAt?: string;
}

export interface Approval {
    id: string;
    tenantId: string;
    runId: string;
    stepId: string;
    status: ApprovalStatus;
    requestedAt: string;
    respondedAt?: string;
    responderId?: string;
    comment?: string;
}

import { prisma, RunStatus, ApprovalStatus, Workflow } from '@governed-action-layer/database';
import { AuditService } from '../lib/audit-service.js';
import { WorkflowDefinition } from '@governed-action-layer/shared';

// Helper to get Principal for Audit (Approximation)
// In a real system, the Activity Context might carry the Principal info
const SYSTEM_ACTOR = {
    id: 'system',
    tenantId: 'system',
    type: 'APP' as const
};

export async function fetchWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition> {
    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
    return workflow.definition as unknown as WorkflowDefinition;
}

export async function updateRunStatus(runId: string, status: RunStatus, output?: any) {
    await prisma.run.update({
        where: { id: runId },
        data: { status, output, completedAt: status === RunStatus.COMPLETED ? new Date() : undefined }
    });
}

export async function recordStepTrace(runId: string, traceData: any) {
    // traceData: { stepId, stepType, status, input, output, startedAt, completedAt }
    await prisma.stepTrace.create({
        data: {
            runId,
            stepId: traceData.stepId,
            stepType: traceData.stepType,
            status: traceData.status,
            input: traceData.input,
            output: traceData.output,
            startedAt: traceData.startedAt,
            completedAt: traceData.completedAt
        }
    });
}

export async function createApprovalTask(runId: string, stepId: string, approverRoles: string[]) {
    const approval = await prisma.approval.create({
        data: {
            runId,
            stepId,
            status: ApprovalStatus.PENDING,
        }
    });
    // Send notification (Stub)
    console.log(`[Notification] Approval requested: ${approval.id} for Roles: ${approverRoles.join(',')}`);
    return approval.id;
}

export async function executeHttpStep(config: any, input: any): Promise<any> {
    // Basic Stub for HTTP
    console.log('[HTTP] Executing', config.url, 'with input', input);
    // Real implementation would use fetch()
    // return fetch(config.url, ...).json()
    return { status: 200, data: { mock: 'data' } };
}

export async function executeAiStep(type: 'summarise' | 'decision', config: any, input: any): Promise<any> {
    console.log(`[AI] Executing ${type} with prompt`, config.prompt);

    // Stub
    if (type === 'summarise') {
        return { summary: "This is a mock summary of the input." };
    }

    if (type === 'decision') {
        // Return first route or random?
        // Let's look for routes in config
        const routes = config.routes || [];
        const decision = routes.length > 0 ? routes[0] : 'default';
        return { decision, confidence: 0.99 };
    }

    return {};
}

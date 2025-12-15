"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWorkflowDefinition = fetchWorkflowDefinition;
exports.updateRunStatus = updateRunStatus;
exports.recordStepTrace = recordStepTrace;
exports.createApprovalTask = createApprovalTask;
exports.executeHttpStep = executeHttpStep;
exports.executeAiStep = executeAiStep;
const database_1 = require("@governed-action-layer/database");
// Helper to get Principal for Audit (Approximation)
// In a real system, the Activity Context might carry the Principal info
const SYSTEM_ACTOR = {
    id: 'system',
    tenantId: 'system',
    type: 'APP'
};
async function fetchWorkflowDefinition(workflowId) {
    const workflow = await database_1.prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow)
        throw new Error(`Workflow ${workflowId} not found`);
    return workflow.definition;
}
async function updateRunStatus(runId, status, output) {
    await database_1.prisma.run.update({
        where: { id: runId },
        data: { status, output, completedAt: status === database_1.RunStatus.COMPLETED ? new Date() : undefined }
    });
}
async function recordStepTrace(runId, traceData) {
    // traceData: { stepId, stepType, status, input, output, startedAt, completedAt }
    await database_1.prisma.stepTrace.create({
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
async function createApprovalTask(runId, stepId, approverRoles) {
    const approval = await database_1.prisma.approval.create({
        data: {
            runId,
            stepId,
            status: database_1.ApprovalStatus.PENDING,
        }
    });
    // Send notification (Stub)
    console.log(`[Notification] Approval requested: ${approval.id} for Roles: ${approverRoles.join(',')}`);
    return approval.id;
}
async function executeHttpStep(config, input) {
    // Basic Stub for HTTP
    console.log('[HTTP] Executing', config.url, 'with input', input);
    // Real implementation would use fetch()
    // return fetch(config.url, ...).json()
    return { status: 200, data: { mock: 'data' } };
}
async function executeAiStep(type, config, input) {
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
//# sourceMappingURL=activities.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalDecisionSignal = void 0;
exports.GenericWorkflow = GenericWorkflow;
const workflow_1 = require("@temporalio/workflow");
const { fetchWorkflowDefinition, updateRunStatus, recordStepTrace, createApprovalTask, executeHttpStep, executeAiStep } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: '1 minute',
});
// Signals
exports.approvalDecisionSignal = (0, workflow_1.defineSignal)('approvalDecision');
async function GenericWorkflow(args) {
    // 1. Get Definition
    const definition = args.definition || await fetchWorkflowDefinition(args.workflowId);
    let currentInput = args.input;
    const traceHistory = [];
    // Simple Linear Execution for MVP (Just find start node or iterate array?)
    // ADR-003 says "Sequential". Let's assume `definition.nodes` is ordered or we follow edges.
    // For MVP "Thin Slice", let's assume valid linear chain or simple graph.
    // Better: Sort nodes by edges or just traverse array?
    // Let's rely on finding standard "Start" -> ... but MVP UI might just be an array.
    // Let's implement a simple traverse: Find node without incoming edges? Or just iterate nodes array in order?
    // Ordered Array is easiest for MVP.
    const nodes = definition.nodes;
    try {
        for (const node of nodes) {
            const stepId = node.id;
            const startTime = new Date().toISOString();
            let output = null;
            let status = 'completed';
            // Execution Logic
            switch (node.type) {
                case 'trigger':
                    // Pass through
                    output = currentInput;
                    break;
                case 'http_action':
                    output = await executeHttpStep(node.data.http, currentInput);
                    break;
                case 'ai_summarise':
                    output = await executeAiStep('summarise', node.data.ai, currentInput);
                    break;
                case 'ai_decision':
                    output = await executeAiStep('decision', node.data.ai, currentInput);
                    // Branching logic would go here: Modify "next node" pointer.
                    // For MVP sequential list, maybe we skip nodes?
                    // Assuming AI Decision just outputs data for now.
                    break;
                case 'approval':
                    // 1. Create Task
                    const approvalId = await createApprovalTask(args.runId, stepId, node.data.approval?.approverRoles || []);
                    // 2. Wait for Signal
                    let decisionData = null;
                    await updateRunStatus(args.runId, 'WAITING_APPROVAL'); // Type cast for Enum string match
                    await (0, workflow_1.condition)(() => decisionData !== null); // Wait for handler updates? 
                    // Wait, condition() checks a predicate. We need a variable to update.
                    // Scope variable for signal handler
                    let approved = false;
                    let rejected = false;
                    (0, workflow_1.setHandler)(exports.approvalDecisionSignal, (payload) => {
                        if (payload.approvalId === approvalId) {
                            if (payload.decision === 'approve')
                                approved = true;
                            if (payload.decision === 'reject')
                                rejected = true;
                            decisionData = payload;
                        }
                    });
                    await (0, workflow_1.condition)(() => approved || rejected);
                    if (rejected) {
                        status = 'failed'; // Or 'cancelled'?
                        throw new Error('Approval Rejected');
                    }
                    output = { decision: 'approved', comment: decisionData?.comment };
                    await updateRunStatus(args.runId, 'RUNNING');
                    break;
                default:
                    console.warn('Unknown step type', node.type);
            }
            // Record Trace
            await recordStepTrace(args.runId, {
                stepId,
                stepType: node.type,
                status,
                input: currentInput,
                output,
                startedAt: startTime,
                completedAt: new Date().toISOString()
            });
            // Update input for next step
            currentInput = output;
        }
        await updateRunStatus(args.runId, 'COMPLETED', currentInput);
        return currentInput;
    }
    catch (err) {
        await updateRunStatus(args.runId, 'FAILED', { error: err.message });
        throw err;
    }
}
//# sourceMappingURL=workflows.js.map
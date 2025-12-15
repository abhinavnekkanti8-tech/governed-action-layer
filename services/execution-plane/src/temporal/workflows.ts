import { proxyActivities, defineSignal, setHandler, condition } from '@temporalio/workflow';
import { WorkflowDefinition } from '@governed-action-layer/shared';
// Import activity types (proxy)
import type * as activities from './activities.js';

const {
    fetchWorkflowDefinition,
    updateRunStatus,
    recordStepTrace,
    createApprovalTask,
    executeHttpStep,
    executeAiStep
} = proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute',
});

// Signals
export const approvalDecisionSignal = defineSignal<[{ approvalId: string; decision: 'approve' | 'reject'; comment?: string }]>('approvalDecision');

export async function GenericWorkflow(args: {
    runId: string;
    workflowId: string;
    input: any;
    definition?: WorkflowDefinition
}): Promise<any> {

    // 1. Get Definition
    const definition = args.definition || await fetchWorkflowDefinition(args.workflowId);
    let currentInput = args.input;
    const traceHistory: any[] = [];

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

            let output: any = null;
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
                    let decisionData: any = null;
                    await updateRunStatus(args.runId, 'WAITING_APPROVAL' as any); // Type cast for Enum string match

                    await condition(() => decisionData !== null); // Wait for handler updates? 
                    // Wait, condition() checks a predicate. We need a variable to update.

                    // Scope variable for signal handler
                    let approved = false;
                    let rejected = false;

                    setHandler(approvalDecisionSignal, (payload) => {
                        if (payload.approvalId === approvalId) {
                            if (payload.decision === 'approve') approved = true;
                            if (payload.decision === 'reject') rejected = true;
                            decisionData = payload;
                        }
                    });

                    await condition(() => approved || rejected);

                    if (rejected) {
                        status = 'failed'; // Or 'cancelled'?
                        throw new Error('Approval Rejected');
                    }

                    output = { decision: 'approved', comment: decisionData?.comment };
                    await updateRunStatus(args.runId, 'RUNNING' as any);
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

        await updateRunStatus(args.runId, 'COMPLETED' as any, currentInput);
        return currentInput;

    } catch (err: any) {
        await updateRunStatus(args.runId, 'FAILED' as any, { error: err.message });
        throw err;
    }
}

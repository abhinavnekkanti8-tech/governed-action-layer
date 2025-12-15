import { WorkflowDefinition } from '@governed-action-layer/shared';
export declare const approvalDecisionSignal: import("@temporalio/workflow").SignalDefinition<[{
    approvalId: string;
    decision: "approve" | "reject";
    comment?: string;
}], string>;
export declare function GenericWorkflow(args: {
    runId: string;
    workflowId: string;
    input: any;
    definition?: WorkflowDefinition;
}): Promise<any>;

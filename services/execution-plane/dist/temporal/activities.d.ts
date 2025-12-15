import { RunStatus } from '@governed-action-layer/database';
import { WorkflowDefinition } from '@governed-action-layer/shared';
export declare function fetchWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition>;
export declare function updateRunStatus(runId: string, status: RunStatus, output?: any): Promise<void>;
export declare function recordStepTrace(runId: string, traceData: any): Promise<void>;
export declare function createApprovalTask(runId: string, stepId: string, approverRoles: string[]): Promise<string>;
export declare function executeHttpStep(config: any, input: any): Promise<any>;
export declare function executeAiStep(type: 'summarise' | 'decision', config: any, input: any): Promise<any>;

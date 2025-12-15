export type StepType = 'trigger' | 'http_action' | 'ai_summarise' | 'ai_decision' | 'approval';
export interface WorkflowDefinition {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}
export interface WorkflowNode {
    id: string;
    type: StepType;
    position: {
        x: number;
        y: number;
    };
    data: StepConfiguration;
}
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}
export interface StepConfiguration {
    label: string;
    http?: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        url: string;
        headers?: Record<string, string>;
    };
    ai?: {
        model: string;
        prompt: string;
        outputSchema?: Record<string, any>;
        routes?: string[];
    };
    approval?: {
        approverRoles: string[];
    };
}
export interface Workflow {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    isPublished: boolean;
    definition: WorkflowDefinition;
    createdAt: string;
    updatedAt: string;
}

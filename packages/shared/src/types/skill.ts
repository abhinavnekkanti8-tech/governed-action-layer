export interface Skill {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    createdAt: string;
}

export interface SkillVersion {
    id: string; // Composite? or UUID
    skillId: string;
    version: string; // SemVer
    workflowId: string; // Source workflow
    inputSchema: Record<string, any>; // JSON Schema
    outputSchema: Record<string, any>; // JSON Schema
    riskTags: string[]; // ['read_only', 'approval_required', etc.]
    publishedAt: string;
    publishedBy: string; // Principal ID
}

export interface Skill {
    id: string;
    tenantId: string;
    name: string;
    description?: string;
    createdAt: string;
}
export interface SkillVersion {
    id: string;
    skillId: string;
    version: string;
    workflowId: string;
    inputSchema: Record<string, any>;
    outputSchema: Record<string, any>;
    riskTags: string[];
    publishedAt: string;
    publishedBy: string;
}

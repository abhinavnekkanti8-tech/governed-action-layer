"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowRoutes = workflowRoutes;
const database_1 = require("@governed-action-layer/database");
const auth_js_1 = require("../middleware/auth.js");
const shared_1 = require("@governed-action-layer/shared");
const zod_1 = require("zod");
const CreateWorkflowSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    folderId: zod_1.z.string().optional(),
});
const UpdateWorkflowSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    definition: zod_1.z.any().optional(), // Validate as WorkflowDefinition stricter later
});
async function workflowRoutes(fastify) {
    fastify.addHook('preHandler', auth_js_1.authMiddleware);
    // List Workflows
    fastify.get('/', async (req) => {
        const workflows = await database_1.prisma.workflow.findMany({
            where: { tenantId: req.principal.tenantId },
            orderBy: { updatedAt: 'desc' },
        });
        return workflows;
    });
    // Create Workflow
    fastify.post('/', async (req) => {
        await (0, auth_js_1.requireRole)([database_1.Role.ADMIN, database_1.Role.BUILDER])(req);
        // Zod validation
        const body = CreateWorkflowSchema.parse(req.body);
        const workflow = await database_1.prisma.workflow.create({
            data: {
                tenantId: req.principal.tenantId,
                name: body.name,
                description: body.description,
                folderId: body.folderId,
                definition: { nodes: [], edges: [] },
            },
        });
        return workflow;
    });
    // Get Workflow
    fastify.get('/:id', async (req) => {
        const { id } = req.params;
        const workflow = await database_1.prisma.workflow.findFirst({
            where: { id, tenantId: req.principal.tenantId },
        });
        if (!workflow)
            throw new shared_1.ApiError(shared_1.ErrorCode.NOT_FOUND, 'Workflow not found');
        return workflow;
    });
    // Update Workflow (Draft)
    fastify.put('/:id', async (req) => {
        await (0, auth_js_1.requireRole)([database_1.Role.ADMIN, database_1.Role.BUILDER])(req);
        const { id } = req.params;
        const body = UpdateWorkflowSchema.parse(req.body);
        const workflow = await database_1.prisma.workflow.findFirst({ where: { id, tenantId: req.principal.tenantId } });
        if (!workflow)
            throw new shared_1.ApiError(shared_1.ErrorCode.NOT_FOUND, 'Workflow not found');
        const updated = await database_1.prisma.workflow.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                definition: body.definition || undefined,
            },
        });
        return updated;
    });
    // PUBLISH WORKFLOW
    fastify.post('/:id/publish', async (req) => {
        await (0, auth_js_1.requireRole)([database_1.Role.ADMIN, database_1.Role.BUILDER])(req);
        const { id } = req.params;
        const { version, comment } = req.body; // Manual version bump for MVP
        if (!version)
            throw new shared_1.ApiError(shared_1.ErrorCode.VALIDATION_ERROR, 'Version is required (e.g. 1.0.0)');
        const workflow = await database_1.prisma.workflow.findFirst({ where: { id, tenantId: req.principal.tenantId } });
        if (!workflow)
            throw new shared_1.ApiError(shared_1.ErrorCode.NOT_FOUND, 'Workflow not found');
        const definition = workflow.definition;
        // 1. Ensure Skill entity exists
        let skill = await database_1.prisma.skill.findFirst({ where: { workflowId: id } });
        if (!skill) {
            skill = await database_1.prisma.skill.create({
                data: {
                    tenantId: req.principal.tenantId,
                    workflowId: id,
                    name: workflow.name,
                    description: workflow.description,
                },
            });
        }
        // 2. Variable Inference / Schema Generation (Stubbed for MVP)
        // Real logic: Traverse nodes, find 'trigger' for inputs, and 'return' for outputs.
        const inputSchema = { type: 'object', properties: { summary_target: { type: 'string' } } }; // Example
        const outputSchema = { type: 'object', properties: { status: { type: 'string' } } };
        // 3. Risk Tag Calculation
        // Real logic: Check for 'http_action', 'write_db', etc.
        const riskTags = ['requires_approval'];
        // 4. Create Skill Version
        const skillVersion = await database_1.prisma.skillVersion.create({
            data: {
                skillId: skill.id,
                version,
                inputSchema,
                outputSchema,
                riskTags,
            },
        });
        // 5. Update Workflow status
        await database_1.prisma.workflow.update({
            where: { id },
            data: { isPublished: true },
        });
        return skillVersion;
    });
}
//# sourceMappingURL=workflows.js.map
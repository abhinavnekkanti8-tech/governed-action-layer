import { FastifyInstance } from 'fastify';
import { prisma, Role } from '@governed-action-layer/database';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { ApiError, ErrorCode, WorkflowDefinition } from '@governed-action-layer/shared';
import { z } from 'zod';

const CreateWorkflowSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    folderId: z.string().optional(),
});

const UpdateWorkflowSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    definition: z.any().optional(), // Validate as WorkflowDefinition stricter later
});

export async function workflowRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authMiddleware);

    // List Workflows
    fastify.get('/', async (req) => {
        const workflows = await prisma.workflow.findMany({
            where: { tenantId: req.principal.tenantId },
            orderBy: { updatedAt: 'desc' },
        });
        return workflows;
    });

    // Create Workflow
    fastify.post('/', async (req) => {
        await requireRole([Role.ADMIN, Role.BUILDER])(req as any);

        // Zod validation
        const body = CreateWorkflowSchema.parse(req.body);

        const workflow = await prisma.workflow.create({
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
        const { id } = req.params as { id: string };
        const workflow = await prisma.workflow.findFirst({
            where: { id, tenantId: req.principal.tenantId },
        });
        if (!workflow) throw new ApiError(ErrorCode.NOT_FOUND, 'Workflow not found');
        return workflow;
    });

    // Update Workflow (Draft)
    fastify.put('/:id', async (req) => {
        await requireRole([Role.ADMIN, Role.BUILDER])(req as any);
        const { id } = req.params as { id: string };
        const body = UpdateWorkflowSchema.parse(req.body);

        const workflow = await prisma.workflow.findFirst({ where: { id, tenantId: req.principal.tenantId } });
        if (!workflow) throw new ApiError(ErrorCode.NOT_FOUND, 'Workflow not found');

        const updated = await prisma.workflow.update({
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
        await requireRole([Role.ADMIN, Role.BUILDER])(req as any);
        const { id } = req.params as { id: string };
        const { version, comment } = req.body as { version: string; comment?: string }; // Manual version bump for MVP

        if (!version) throw new ApiError(ErrorCode.VALIDATION_ERROR, 'Version is required (e.g. 1.0.0)');

        const workflow = await prisma.workflow.findFirst({ where: { id, tenantId: req.principal.tenantId } });
        if (!workflow) throw new ApiError(ErrorCode.NOT_FOUND, 'Workflow not found');

        const definition = workflow.definition as unknown as WorkflowDefinition;

        // 1. Ensure Skill entity exists
        let skill = await prisma.skill.findFirst({ where: { workflowId: id } });
        if (!skill) {
            skill = await prisma.skill.create({
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
        const riskTags: string[] = ['requires_approval'];

        // 4. Create Skill Version
        const skillVersion = await prisma.skillVersion.create({
            data: {
                skillId: skill.id,
                version,
                inputSchema,
                outputSchema,
                riskTags,
            },
        });

        // 5. Update Workflow status
        await prisma.workflow.update({
            where: { id },
            data: { isPublished: true },
        });

        return skillVersion;
    });
}

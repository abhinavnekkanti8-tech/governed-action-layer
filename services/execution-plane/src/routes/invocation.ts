import { FastifyInstance } from 'fastify';
import { prisma, Role, RunStatus } from '@governed-action-layer/database';
import { ApiError, ErrorCode, validateOrThrow } from '@governed-action-layer/shared';
import { authMiddleware } from '../middleware/auth.js';
import { AuditService } from '../lib/audit-service.js';
import { getTemporalClient } from '../lib/temporal-client.js';

export async function invocationRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authMiddleware);

    fastify.post('/:skillId/invoke', async (req) => {
        const { skillId } = req.params as { skillId: string };
        const input = req.body as any;

        // 1. Get Skill Version (Latest for MVP)
        const skill = await prisma.skill.findFirst({
            where: { id: skillId, tenantId: req.principal.tenantId },
            include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });

        if (!skill || skill.versions.length === 0) {
            throw new ApiError(ErrorCode.NOT_FOUND, 'Skill not found');
        }

        const version = skill.versions[0];

        // 2. Validate Input
        try {
            validateOrThrow(version.inputSchema as object, input);
        } catch (err: any) {
            throw new ApiError(ErrorCode.VALIDATION_ERROR, 'Input schema validation failed', err.details);
        }

        // 3. Create Run Record
        // Note: TypeScript might complain about Enum mapping if case mismatch. 
        // Prisma Enums are usually UPPERCASE. Principal type is 'USER'|'APP'|'AGENT'.
        // req.principal.type should match or need mapping.

        const run = await prisma.run.create({
            data: {
                tenantId: req.principal.tenantId,
                skillId: skill.id,
                skillVersionId: version.id,
                invokerId: req.principal.id,
                invokerType: req.principal.type,
                status: RunStatus.PENDING,
                input: input, // DB will store JSON
            },
        });

        // 4. Start Temporal Workflow
        try {
            const client = await getTemporalClient();
            await client.workflow.start('GenericWorkflow', {
                taskQueue: 'anti-gravity-queue',
                workflowId: run.id,
                args: [
                    // Pass necessary data to workflow
                    {
                        workflowId: skill.workflowId,
                        runId: run.id,
                        input,
                        definition: null // Worker will load definition or we pass it here?
                        // Ideally pass the definition here so the worker is stateless logic
                    }
                ],
            });

            // Update status to RUNNING
            await prisma.run.update({ where: { id: run.id }, data: { status: RunStatus.RUNNING } });
        } catch (err) {
            // If Temporal fails, fail the run
            await prisma.run.update({
                where: { id: run.id },
                data: { status: RunStatus.FAILED, error: String(err) }
            });
            throw new ApiError(ErrorCode.INTERNAL_ERROR, 'Failed to start workflow execution');
        }

        // 5. Audit
        await AuditService.log(req.principal, 'skill_invoked', { skillId, versionId: version.id, runId: run.id }, run.id);

        return { runId: run.id, status: 'PENDING' };
    });
}

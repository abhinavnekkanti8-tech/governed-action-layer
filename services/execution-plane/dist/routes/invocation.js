"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invocationRoutes = invocationRoutes;
const database_1 = require("@governed-action-layer/database");
const shared_1 = require("@governed-action-layer/shared");
const auth_js_1 = require("../middleware/auth.js");
const audit_service_js_1 = require("../lib/audit-service.js");
const temporal_client_js_1 = require("../lib/temporal-client.js");
async function invocationRoutes(fastify) {
    fastify.addHook('preHandler', auth_js_1.authMiddleware);
    fastify.post('/:skillId/invoke', async (req) => {
        const { skillId } = req.params;
        const input = req.body;
        // 1. Get Skill Version (Latest for MVP)
        const skill = await database_1.prisma.skill.findFirst({
            where: { id: skillId, tenantId: req.principal.tenantId },
            include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        if (!skill || skill.versions.length === 0) {
            throw new shared_1.ApiError(shared_1.ErrorCode.NOT_FOUND, 'Skill not found');
        }
        const version = skill.versions[0];
        // 2. Validate Input
        try {
            (0, shared_1.validateOrThrow)(version.inputSchema, input);
        }
        catch (err) {
            throw new shared_1.ApiError(shared_1.ErrorCode.VALIDATION_ERROR, 'Input schema validation failed', err.details);
        }
        // 3. Create Run Record
        // Note: TypeScript might complain about Enum mapping if case mismatch. 
        // Prisma Enums are usually UPPERCASE. Principal type is 'USER'|'APP'|'AGENT'.
        // req.principal.type should match or need mapping.
        const run = await database_1.prisma.run.create({
            data: {
                tenantId: req.principal.tenantId,
                skillId: skill.id,
                skillVersionId: version.id,
                invokerId: req.principal.id,
                invokerType: req.principal.type,
                status: database_1.RunStatus.PENDING,
                input: input, // DB will store JSON
            },
        });
        // 4. Start Temporal Workflow
        try {
            const client = await (0, temporal_client_js_1.getTemporalClient)();
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
            await database_1.prisma.run.update({ where: { id: run.id }, data: { status: database_1.RunStatus.RUNNING } });
        }
        catch (err) {
            // If Temporal fails, fail the run
            await database_1.prisma.run.update({
                where: { id: run.id },
                data: { status: database_1.RunStatus.FAILED, error: String(err) }
            });
            throw new shared_1.ApiError(shared_1.ErrorCode.INTERNAL_ERROR, 'Failed to start workflow execution');
        }
        // 5. Audit
        await audit_service_js_1.AuditService.log(req.principal, 'skill_invoked', { skillId, versionId: version.id, runId: run.id }, run.id);
        return { runId: run.id, status: 'PENDING' };
    });
}
//# sourceMappingURL=invocation.js.map
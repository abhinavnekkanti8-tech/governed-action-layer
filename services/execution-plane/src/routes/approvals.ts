import { FastifyInstance } from 'fastify';
import { prisma, Role, ApprovalStatus } from '@governed-action-layer/database';
import { ApiError, ErrorCode } from '@governed-action-layer/shared';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AuditService } from '../lib/audit-service.js';
import { getTemporalClient } from '../lib/temporal-client.js';

export async function approvalRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', authMiddleware);

    // List Pending Approvals
    fastify.get('/', async (req) => {
        // Only Operators and Admins should see approvals? Or maybe Builders too?
        // MVP: Accessible by authorized roles
        await requireRole([Role.ADMIN, Role.OPERATOR])(req as any);

        const approvals = await prisma.approval.findMany({
            where: {
                run: { tenantId: req.principal.tenantId },
                status: ApprovalStatus.PENDING
            },
            include: { run: { include: { skill: true } } },
            orderBy: { requestedAt: 'desc' }
        });
        return approvals;
    });

    // Make Decision
    fastify.post('/:id/decision', async (req) => {
        await requireRole([Role.ADMIN, Role.OPERATOR])(req as any);
        const { id } = req.params as { id: string };
        const { decision, comment } = req.body as { decision: 'approve' | 'reject'; comment?: string };

        const approval = await prisma.approval.findFirst({
            where: { id, run: { tenantId: req.principal.tenantId } }
        });

        if (!approval) throw new ApiError(ErrorCode.NOT_FOUND, 'Approval task not found');
        if (approval.status !== ApprovalStatus.PENDING) {
            throw new ApiError(ErrorCode.CONFLICT, 'Approval already decided');
        }

        const newStatus = decision === 'approve' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

        // 1. Update DB
        await prisma.approval.update({
            where: { id },
            data: {
                status: newStatus,
                responderId: req.principal.id,
                respondedAt: new Date(),
                comment
            }
        });

        // 2. Signal Temporal
        try {
            const client = await getTemporalClient();
            const handle = client.workflow.getHandle(approval.runId);
            await handle.signal('approvalDecision', { approvalId: id, decision, comment });
        } catch (err) {
            // Log error but don't fail the request entirely? Or fail?
            // If we fail here, DB is updated but Temporal isn't. Inconsistency.
            // MVP: Fail loud.
            throw new ApiError(ErrorCode.INTERNAL_ERROR, 'Failed to signal workflow engine');
        }

        // 3. Audit
        await AuditService.log(req.principal, 'approval_decision', { approvalId: id, decision, comment }, approval.runId);

        return { status: 'ok' };
    });
}

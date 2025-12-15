"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvalRoutes = approvalRoutes;
const database_1 = require("@governed-action-layer/database");
const shared_1 = require("@governed-action-layer/shared");
const auth_js_1 = require("../middleware/auth.js");
const audit_service_js_1 = require("../lib/audit-service.js");
const temporal_client_js_1 = require("../lib/temporal-client.js");
async function approvalRoutes(fastify) {
    fastify.addHook('preHandler', auth_js_1.authMiddleware);
    // List Pending Approvals
    fastify.get('/', async (req) => {
        // Only Operators and Admins should see approvals? Or maybe Builders too?
        // MVP: Accessible by authorized roles
        await (0, auth_js_1.requireRole)([database_1.Role.ADMIN, database_1.Role.OPERATOR])(req);
        const approvals = await database_1.prisma.approval.findMany({
            where: {
                run: { tenantId: req.principal.tenantId },
                status: database_1.ApprovalStatus.PENDING
            },
            include: { run: { include: { skill: true } } },
            orderBy: { requestedAt: 'desc' }
        });
        return approvals;
    });
    // Make Decision
    fastify.post('/:id/decision', async (req) => {
        await (0, auth_js_1.requireRole)([database_1.Role.ADMIN, database_1.Role.OPERATOR])(req);
        const { id } = req.params;
        const { decision, comment } = req.body;
        const approval = await database_1.prisma.approval.findFirst({
            where: { id, run: { tenantId: req.principal.tenantId } }
        });
        if (!approval)
            throw new shared_1.ApiError(shared_1.ErrorCode.NOT_FOUND, 'Approval task not found');
        if (approval.status !== database_1.ApprovalStatus.PENDING) {
            throw new shared_1.ApiError(shared_1.ErrorCode.CONFLICT, 'Approval already decided');
        }
        const newStatus = decision === 'approve' ? database_1.ApprovalStatus.APPROVED : database_1.ApprovalStatus.REJECTED;
        // 1. Update DB
        await database_1.prisma.approval.update({
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
            const client = await (0, temporal_client_js_1.getTemporalClient)();
            const handle = client.workflow.getHandle(approval.runId);
            await handle.signal('approvalDecision', { approvalId: id, decision, comment });
        }
        catch (err) {
            // Log error but don't fail the request entirely? Or fail?
            // If we fail here, DB is updated but Temporal isn't. Inconsistency.
            // MVP: Fail loud.
            throw new shared_1.ApiError(shared_1.ErrorCode.INTERNAL_ERROR, 'Failed to signal workflow engine');
        }
        // 3. Audit
        await audit_service_js_1.AuditService.log(req.principal, 'approval_decision', { approvalId: id, decision, comment }, approval.runId);
        return { status: 'ok' };
    });
}
//# sourceMappingURL=approvals.js.map
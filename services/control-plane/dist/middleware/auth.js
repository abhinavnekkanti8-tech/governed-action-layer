"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireRole = requireRole;
const database_1 = require("@governed-action-layer/database");
const shared_1 = require("@governed-action-layer/shared");
async function authMiddleware(request, reply) {
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
        throw new shared_1.ApiError(shared_1.ErrorCode.UNAUTHORIZED, 'Missing API Key');
    }
    // MVP: We are treating the API Key as the Principal ID directly for simplicity
    // In real life, we'd lookup an ApiKey table
    const principalId = apiKey;
    const principal = await database_1.prisma.principal.findUnique({
        where: { id: principalId },
        include: {
            tenant: true,
            roleAssignments: true,
        },
    });
    if (!principal) {
        throw new shared_1.ApiError(shared_1.ErrorCode.UNAUTHORIZED, 'Invalid API Key');
    }
    // Assume single role for MVP context or take the highest
    // Since Principal is scoped to Tenant, we just take the first role assignment
    const assignment = principal.roleAssignments[0];
    if (!assignment) {
        throw new shared_1.ApiError(shared_1.ErrorCode.FORBIDDEN, 'No role assigned');
    }
    request.principal = {
        ...principal,
        tenant: principal.tenant,
        role: assignment.role,
    };
}
function requireRole(allowedRoles) {
    return async (request) => {
        if (!allowedRoles.includes(request.principal.role)) {
            throw new shared_1.ApiError(shared_1.ErrorCode.FORBIDDEN, 'Insufficient Permissions');
        }
    };
}
//# sourceMappingURL=auth.js.map
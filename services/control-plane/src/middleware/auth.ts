import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, Principal, Tenant, RoleAssignment, Role } from '@governed-action-layer/database';
import { ApiError, ErrorCode } from '@governed-action-layer/shared';

// Extend Fastify Request type
declare module 'fastify' {
    interface FastifyRequest {
        principal: Principal & { tenant: Tenant; role: Role };
    }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey) {
        throw new ApiError(ErrorCode.UNAUTHORIZED, 'Missing API Key');
    }

    // MVP: We are treating the API Key as the Principal ID directly for simplicity
    // In real life, we'd lookup an ApiKey table
    const principalId = apiKey;

    const principal = await prisma.principal.findUnique({
        where: { id: principalId },
        include: {
            tenant: true,
            roleAssignments: true,
        },
    });

    if (!principal) {
        throw new ApiError(ErrorCode.UNAUTHORIZED, 'Invalid API Key');
    }

    // Assume single role for MVP context or take the highest
    // Since Principal is scoped to Tenant, we just take the first role assignment
    const assignment = principal.roleAssignments[0];

    if (!assignment) {
        throw new ApiError(ErrorCode.FORBIDDEN, 'No role assigned');
    }

    request.principal = {
        ...principal,
        tenant: principal.tenant,
        role: assignment.role,
    };
}

export function requireRole(allowedRoles: Role[]) {
    return async (request: FastifyRequest) => {
        if (!allowedRoles.includes(request.principal.role)) {
            throw new ApiError(ErrorCode.FORBIDDEN, 'Insufficient Permissions');
        }
    };
}

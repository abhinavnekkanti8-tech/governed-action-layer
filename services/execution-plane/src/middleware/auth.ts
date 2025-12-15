import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma, Principal, Tenant, RoleAssignment, Role } from '@governed-action-layer/database';
import { ApiError, ErrorCode } from '@governed-action-layer/shared';

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

    const principalId = apiKey; // MVP: API Key is ID

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

    // Take the first role assignment for simplicity in MVP
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

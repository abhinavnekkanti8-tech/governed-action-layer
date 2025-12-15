import { FastifyRequest, FastifyReply } from 'fastify';
import { Principal, Tenant, Role } from '@governed-action-layer/database';
declare module 'fastify' {
    interface FastifyRequest {
        principal: Principal & {
            tenant: Tenant;
            role: Role;
        };
    }
}
export declare function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function requireRole(allowedRoles: Role[]): (request: FastifyRequest) => Promise<void>;

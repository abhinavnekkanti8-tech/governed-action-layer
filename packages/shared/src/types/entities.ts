export type Role = 'admin' | 'builder' | 'operator' | 'viewer';

export interface Tenant {
    id: string;
    name: string;
    createdAt: string; // ISO date
}

export interface Principal {
    id: string;
    tenantId: string;
    type: 'user' | 'app' | 'agent';
    name: string;
    roles: Role[];
}

export interface RoleAssignment {
    principalId: string;
    tenantId: string;
    role: Role;
}

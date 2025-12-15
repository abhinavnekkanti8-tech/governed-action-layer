import { Principal } from '@governed-action-layer/database';
export declare class AuditService {
    static log(principal: Principal, eventType: string, details?: any, resourceId?: string): Promise<void>;
}

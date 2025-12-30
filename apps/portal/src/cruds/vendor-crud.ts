/**
 * Vendor CRUD Instance
 * 
 * Uses crudS() factory with VendorRepository.
 * Provides CRUD-S operations with policy checks and audit hooks.
 */

import { crudS } from '@nexus/cruds';
import type { RequestContext } from '@nexus/cruds';
import { VendorRepository, type Vendor } from '../repositories/vendor-repository';

const vendorRepo = new VendorRepository();

// Simple policy check (TODO: Implement proper RBAC)
const policyCheck = async (ctx: RequestContext, action: string): Promise<void> => {
    // For now, allow all actions if user is authenticated
    // TODO: Implement proper policy checks based on user roles
    if (!ctx.actor.userId) {
        throw new Error('Unauthorized');
    }
};

// Simple audit hook (TODO: Implement proper audit logging)
const audit = async (
    ctx: RequestContext,
    action: string,
    recordId: string,
    data?: Record<string, unknown>
): Promise<void> => {
    // For now, just log (TODO: Implement proper audit logging)
    console.log(`[AUDIT] ${action}`, { recordId, userId: ctx.actor.userId, data });
};

export const vendorCRUD = crudS<Vendor>({
    entity: 'vendor',
    repo: vendorRepo,
    policyCheck,
    audit,
});


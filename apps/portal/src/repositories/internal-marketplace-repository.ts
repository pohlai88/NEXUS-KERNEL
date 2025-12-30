/**
 * Internal Marketplace Repository
 * 
 * Group Inventory Visibility: Subsidiaries can see inventory from other subsidiaries.
 * "Subsidiary A has 50 extra laptops. Subsidiary B needs laptops and requests transfer."
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface InventoryItem {
  id: string;
  tenant_id: string;
  tenant_name: string;
  item_code: string;
  item_name: string;
  category: string;
  quantity_available: number;
  quantity_reserved: number;
  unit_price: number | null;
  currency_code: string;
  location: string | null;
  condition: 'new' | 'used' | 'refurbished';
  metadata: Record<string, unknown>;
  last_updated_at: string;
}

export interface TransferRequest {
  id: string;
  group_id: string;
  source_tenant_id: string;
  destination_tenant_id: string;
  item_code: string;
  item_name: string;
  quantity_requested: number;
  quantity_approved: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'in_transit' | 'completed' | 'cancelled';
  requested_by: string;
  requested_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface InventorySearchFilters {
  item_code?: string;
  item_name?: string;
  category?: string;
  condition?: InventoryItem['condition'];
  min_quantity?: number;
  tenant_id?: string;
}

export class InternalMarketplaceRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Search inventory across group (all subsidiaries)
   */
  async searchInventory(
    groupId: string,
    filters?: InventorySearchFilters
  ): Promise<InventoryItem[]> {
    // Get all tenants in group
    const { data: tenants } = await this.supabase
      .from('tenants')
      .select('id, name')
      .eq('group_id', groupId);

    if (!tenants || tenants.length === 0) {
      return [];
    }

    const tenantIds = filters?.tenant_id
      ? [filters.tenant_id]
      : tenants.map((t) => t.id);

    // Query inventory (assuming inventory table exists)
    // This is a placeholder - actual implementation depends on inventory table structure
    let query = this.supabase
      .from('inventory_items') // Placeholder table name
      .select('*, tenants!inner(name)')
      .in('tenant_id', tenantIds)
      .gt('quantity_available', 0); // Only show available items

    if (filters?.item_code) {
      query = query.ilike('item_code', `%${filters.item_code}%`);
    }

    if (filters?.item_name) {
      query = query.ilike('item_name', `%${filters.item_name}%`);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.condition) {
      query = query.eq('condition', filters.condition);
    }

    if (filters?.min_quantity) {
      query = query.gte('quantity_available', filters.min_quantity);
    }

    const { data: items, error } = await query.order('quantity_available', { ascending: false });

    if (error) {
      // If table doesn't exist, return empty array (graceful degradation)
      if (error.code === '42P01') {
        return [];
      }
      throw new Error(`Failed to search inventory: ${error.message}`);
    }

    return (items || []).map((item) => this.mapRowToInventoryItem(item, tenants));
  }

  /**
   * Create transfer request
   */
  async createTransferRequest(
    groupId: string,
    sourceTenantId: string,
    destinationTenantId: string,
    itemCode: string,
    itemName: string,
    quantityRequested: number,
    requestedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<TransferRequest> {
    // Verify both tenants are in same group
    const { data: sourceTenant } = await this.supabase
      .from('tenants')
      .select('group_id')
      .eq('id', sourceTenantId)
      .single();

    const { data: destTenant } = await this.supabase
      .from('tenants')
      .select('group_id')
      .eq('id', destinationTenantId)
      .single();

    if (!sourceTenant || !destTenant) {
      throw new Error('Source or destination tenant not found');
    }

    if (sourceTenant.group_id !== destTenant.group_id) {
      throw new Error('Cannot transfer between different groups');
    }

    // Create transfer request
    const { data: requestData, error } = await this.supabase
      .from('internal_transfer_requests')
      .insert({
        group_id: groupId,
        source_tenant_id: sourceTenantId,
        destination_tenant_id: destinationTenantId,
        item_code: itemCode,
        item_name: itemName,
        quantity_requested: quantityRequested,
        status: 'pending',
        requested_by: requestedBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create transfer request: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'transfer_request',
      entity_id: requestData.id,
      action: 'create',
      action_by: requestedBy,
      new_state: requestData,
      workflow_stage: 'pending',
      workflow_state: {
        source_tenant: sourceTenantId,
        destination_tenant: destinationTenantId,
        item_code: itemCode,
        quantity_requested: quantityRequested,
      },
      tenant_id: groupId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToTransferRequest(requestData);
  }

  /**
   * Approve transfer request
   */
  async approveTransferRequest(
    requestId: string,
    quantityApproved: number,
    approvedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<TransferRequest> {
    const request = await this.getTransferRequestById(requestId);
    if (!request) {
      throw new Error('Transfer request not found');
    }

    const { data: updatedRequest, error } = await this.supabase
      .from('internal_transfer_requests')
      .update({
        status: 'approved',
        quantity_approved: quantityApproved,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve transfer request: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'transfer_request',
      entity_id: requestId,
      action: 'approve',
      action_by: approvedBy,
      old_state: request,
      new_state: updatedRequest,
      workflow_stage: 'approved',
      workflow_state: {
        quantity_approved: quantityApproved,
        approved_by: approvedBy,
      },
      tenant_id: request.group_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToTransferRequest(updatedRequest);
  }

  /**
   * Get transfer request by ID
   */
  async getTransferRequestById(requestId: string): Promise<TransferRequest | null> {
    const { data, error } = await this.supabase
      .from('internal_transfer_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get transfer request: ${error.message}`);
    }

    return this.mapRowToTransferRequest(data);
  }

  /**
   * Map database row to InventoryItem
   */
  private mapRowToInventoryItem(
    row: unknown,
    tenants: Array<{ id: string; name: string }>
  ): InventoryItem {
    const r = row as Record<string, unknown>;
    const tenantId = r.tenant_id as string;
    const tenant = tenants.find((t) => t.id === tenantId);

    return {
      id: r.id as string,
      tenant_id: tenantId,
      tenant_name: tenant?.name || 'Unknown',
      item_code: r.item_code as string,
      item_name: r.item_name as string,
      category: (r.category as string) || 'uncategorized',
      quantity_available: (r.quantity_available as number) || 0,
      quantity_reserved: (r.quantity_reserved as number) || 0,
      unit_price: (r.unit_price as number) || null,
      currency_code: (r.currency_code as string) || 'USD',
      location: (r.location as string) || null,
      condition: (r.condition as InventoryItem['condition']) || 'new',
      metadata: (r.metadata as Record<string, unknown>) || {},
      last_updated_at: r.last_updated_at as string,
    };
  }

  /**
   * Map database row to TransferRequest
   */
  private mapRowToTransferRequest(row: unknown): TransferRequest {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      group_id: r.group_id as string,
      source_tenant_id: r.source_tenant_id as string,
      destination_tenant_id: r.destination_tenant_id as string,
      item_code: r.item_code as string,
      item_name: r.item_name as string,
      quantity_requested: (r.quantity_requested as number) || 0,
      quantity_approved: (r.quantity_approved as number) || null,
      status: r.status as TransferRequest['status'],
      requested_by: r.requested_by as string,
      requested_at: r.requested_at as string,
      approved_by: (r.approved_by as string) || null,
      approved_at: (r.approved_at as string) || null,
      rejection_reason: (r.rejection_reason as string) || null,
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


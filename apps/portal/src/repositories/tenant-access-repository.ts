/**
 * Tenant Access Repository
 * 
 * Hierarchical Multi-Tenancy: One User → Many Tenants (Federation Model)
 * Group of Companies: Users can access multiple subsidiaries without logging out.
 */

import { createClient } from '@/lib/supabase-client';

export interface TenantAccess {
  id: string;
  user_id: string;
  tenant_id: string;
  role: 'admin' | 'viewer' | 'vendor_admin' | 'procurement_manager' | 'group_manager';
  granted_at: string;
  granted_by: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface GroupAccess {
  id: string;
  user_id: string;
  group_id: string;
  role: 'group_admin' | 'group_manager' | 'viewer';
  granted_at: string;
  granted_by: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface Group {
  id: string;
  name: string;
  legal_name: string;
  country_code: string;
  parent_group_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export class TenantAccessRepository {
  private supabase = createClient();

  /**
   * Get accessible tenants for current user
   */
  async getAccessibleTenants(userId: string): Promise<TenantAccess[]> {
    const { data, error } = await this.supabase
      .from('tenant_access')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('granted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get accessible tenants: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToTenantAccess(row));
  }

  /**
   * Get accessible groups for current user
   */
  async getAccessibleGroups(userId: string): Promise<GroupAccess[]> {
    const { data, error } = await this.supabase
      .from('group_access')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('granted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get accessible groups: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToGroupAccess(row));
  }

  /**
   * Get all tenants in a group
   */
  async getTenantsInGroup(groupId: string): Promise<unknown[]> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('group_id', groupId)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to get tenants in group: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Grant tenant access to user
   */
  async grantTenantAccess(
    userId: string,
    tenantId: string,
    role: TenantAccess['role'],
    grantedBy: string
  ): Promise<TenantAccess> {
    const { data, error } = await this.supabase
      .from('tenant_access')
      .insert({
        user_id: userId,
        tenant_id: tenantId,
        role,
        granted_by: grantedBy,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to grant tenant access: ${error.message}`);
    }

    return this.mapRowToTenantAccess(data);
  }

  /**
   * Revoke tenant access from user
   */
  async revokeTenantAccess(userId: string, tenantId: string): Promise<void> {
    const { error } = await this.supabase
      .from('tenant_access')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('tenant_id', tenantId);

    if (error) {
      throw new Error(`Failed to revoke tenant access: ${error.message}`);
    }
  }

  /**
   * Get accessible tenant IDs array (for use in queries)
   */
  async getAccessibleTenantIds(userId: string): Promise<string[]> {
    const tenants = await this.getAccessibleTenants(userId);
    return tenants.map((t) => t.tenant_id);
  }

  /**
   * Check if user has access to tenant
   */
  async hasAccess(userId: string, tenantId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('tenant_access')
      .select('id')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to check access: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Map database row to TenantAccess
   */
  private mapRowToTenantAccess(row: unknown): TenantAccess {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      user_id: r.user_id as string,
      tenant_id: r.tenant_id as string,
      role: r.role as TenantAccess['role'],
      granted_at: r.granted_at as string,
      granted_by: (r.granted_by as string) || null,
      is_active: (r.is_active as boolean) || false,
      metadata: (r.metadata as Record<string, unknown>) || {},
    };
  }

  /**
   * Map database row to GroupAccess
   */
  private mapRowToGroupAccess(row: unknown): GroupAccess {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      user_id: r.user_id as string,
      group_id: r.group_id as string,
      role: r.role as GroupAccess['role'],
      granted_at: r.granted_at as string,
      granted_by: (r.granted_by as string) || null,
      is_active: (r.is_active as boolean) || false,
      metadata: (r.metadata as Record<string, unknown>) || {},
    };
  }
}


/**
 * Vendor Repository
 *
 * Database entity type - does NOT extend Kernel VendorPayload directly
 * since database doesn't store schema header fields.
 * Use VendorPayload for API contract validation when needed.
 */

import { createClient } from '@/lib/supabase-client';
import type { VendorPayload } from '@nexus/kernel';
import type { Repository, SoftDeleteRecord } from '@nexus/cruds';

export interface VendorFilters {
  status?: string;
  search?: string;
  country_code?: string;
}

// Official alias types (matching Kernel structure)
export type OfficialAlias =
  | { type: 'SSM'; value: string; jurisdiction: 'MY' }
  | { type: 'TAX_ID'; value: string; jurisdiction: string };

// Vendor database entity type (does not extend VendorPayload)
// Schema header fields are NOT stored in database
export interface Vendor extends SoftDeleteRecord {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  // Vendor fields (matching VendorPayload structure without schema header)
  legal_name: string;
  display_name?: string;
  country_code: string;
  email?: string;
  phone?: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  official_aliases: OfficialAlias[];
}

// Database row type (matches Kernel exactly)
interface DatabaseVendorRow {
  id: string;
  tenant_id: string;
  legal_name: string; // ✅ Kernel-aligned (no mapping)
  display_name: string | null;
  country_code: string;
  email: string | null;
  phone: string | null;
  status: string; // PENDING, SUBMITTED, APPROVED, REJECTED, SUSPENDED
  official_aliases: unknown; // JSONB
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export class VendorRepository implements Repository<Vendor> {
  public supabase = createClient(); // Made public for multi-tenant queries

  /**
   * Find vendor by ID
   */
  async findById(id: string): Promise<Vendor | null> {
    const { data, error } = await this.supabase
      .from('vmp_vendors')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null) // Soft delete filter
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get vendor: ${error.message}`);
    }

    return this.mapRowToVendor(data);
  }

  /**
   * Find all vendors with optional filters
   */
  async findAll(filters?: Record<string, unknown>): Promise<Vendor[]> {
    let query = this.supabase
      .from('vmp_vendors')
      .select('*')
      .is('deleted_at', null) // Soft delete filter
      .order('created_at', { ascending: false });

    // Apply filters
    const vendorFilters = filters as VendorFilters | undefined;

    if (vendorFilters?.status) {
      query = query.eq('status', vendorFilters.status);
    }

    if (vendorFilters?.country_code) {
      query = query.eq('country_code', vendorFilters.country_code);
    }

    if (vendorFilters?.search) {
      query = query.or(
        `legal_name.ilike.%${vendorFilters.search}%,display_name.ilike.%${vendorFilters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list vendors: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToVendor(row));
  }

  /**
   * Create new vendor
   */
  async create(data: Omit<Vendor, 'id' | 'deletedAt' | 'deletedBy'>): Promise<Vendor> {
    // Extract tenant_id from data (should be provided by RequestContext)
    const tenantId = (data as unknown as { tenant_id: string }).tenant_id;
    if (!tenantId) {
      throw new Error('tenant_id is required');
    }

    const row: Omit<DatabaseVendorRow, 'id' | 'created_at' | 'updated_at'> = {
      tenant_id: tenantId,
      legal_name: data.legal_name, // ✅ Direct Kernel field (no mapping)
      display_name: data.display_name || null,
      country_code: data.country_code,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status,
      official_aliases: data.official_aliases || [],
      deleted_at: null,
    };

    const { data: inserted, error } = await this.supabase
      .from('vmp_vendors')
      .insert(row)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create vendor: ${error.message}`);
    }

    return this.mapRowToVendor(inserted);
  }

  /**
   * Update existing vendor
   */
  async update(
    id: string,
    data: Partial<Omit<Vendor, 'id' | 'deletedAt' | 'deletedBy'>>
  ): Promise<Vendor> {
    const updateData: Partial<DatabaseVendorRow> = {};

    // Only include fields that are provided
    if (data.legal_name !== undefined) updateData.legal_name = data.legal_name;
    if (data.display_name !== undefined) updateData.display_name = data.display_name || null;
    if (data.country_code !== undefined) updateData.country_code = data.country_code;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.official_aliases !== undefined) updateData.official_aliases = data.official_aliases;

    updateData.updated_at = new Date().toISOString();

    const { data: updated, error } = await this.supabase
      .from('vmp_vendors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update vendor: ${error.message}`);
    }

    return this.mapRowToVendor(updated);
  }

  /**
   * Soft delete vendor
   */
  async softDelete(id: string, deletedBy: string): Promise<Vendor> {
    const { data, error } = await this.supabase
      .from('vmp_vendors')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete vendor: ${error.message}`);
    }

    return this.mapRowToVendor(data);
  }

  /**
   * Restore soft-deleted vendor
   */
  async restore(id: string): Promise<Vendor> {
    const { data, error } = await this.supabase
      .from('vmp_vendors')
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to restore vendor: ${error.message}`);
    }

    return this.mapRowToVendor(data);
  }

  /**
   * Hard delete vendor (permanent)
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase.from('vmp_vendors').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to hard delete vendor: ${error.message}`);
    }
  }

  /**
   * Map database row to Vendor (direct mapping, no translation)
   */
  private mapRowToVendor(row: DatabaseVendorRow): Vendor {
    return {
      id: row.id,
      tenant_id: row.tenant_id,
      legal_name: row.legal_name, // ✅ Direct mapping (no translation)
      display_name: row.display_name || undefined,
      country_code: row.country_code,
      email: row.email || undefined,
      phone: row.phone || undefined,
      status: row.status as Vendor['status'], // ✅ Typed status
      official_aliases: (row.official_aliases as OfficialAlias[]) || [],
      created_at: row.created_at,
      updated_at: row.updated_at,
      deleted_at: row.deleted_at,
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
      deletedBy: null, // TODO: Add deleted_by column if needed
    };
  }
}


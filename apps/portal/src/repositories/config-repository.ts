/**
 * Hierarchical Configuration Repository
 *
 * Manages configuration at multiple levels with inheritance:
 *
 * Priority Order (Highest to Lowest):
 * 1. User Personal Config (tenant_user_personal / vendor_user_personal)
 * 2. User Admin Config (tenant_user_admin / vendor_user_global)
 * 3. Tenant Config (tenants.settings)
 * 4. Portal Global Config (portal_global_config)
 *
 * Config Types:
 * - Portal Global: System defaults for all tenants and vendors
 * - Tenant: Tenant-specific overrides
 * - Tenant User Admin: Admin-set defaults for tenant users
 * - Tenant User Personal: Individual tenant user preferences
 * - Vendor Global: Vendor-wide defaults
 * - Vendor User Personal: Individual vendor user preferences
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface ConfigValue {
  [key: string]: unknown;
}

export interface PortalGlobalConfig {
  id: string;
  config_type: 'tenant_defaults' | 'vendor_defaults' | 'system_defaults';
  config_data: ConfigValue;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface TenantConfig {
  tenant_id: string;
  config_data: ConfigValue;
  updated_at: string;
  updated_by: string;
}

export interface TenantUserAdminConfig {
  tenant_id: string;
  config_data: ConfigValue;
  updated_at: string;
  updated_by: string;
}

export interface TenantUserPersonalConfig {
  tenant_id: string;
  user_id: string;
  config_data: ConfigValue;
  updated_at: string;
}

export interface VendorGlobalConfig {
  vendor_id: string;
  config_data: ConfigValue;
  updated_at: string;
  updated_by: string;
}

export interface VendorUserPersonalConfig {
  vendor_id: string;
  user_id: string;
  config_data: ConfigValue;
  updated_at: string;
}

export interface ResolvedConfig {
  config: ConfigValue;
  sources: {
    portal_global?: boolean;
    tenant?: boolean;
    tenant_user_admin?: boolean;
    tenant_user_personal?: boolean;
    vendor_global?: boolean;
    vendor_user_personal?: boolean;
  };
}

export class ConfigRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Get Portal Global Config
   */
  async getPortalGlobalConfig(configType: 'tenant_defaults' | 'vendor_defaults' | 'system_defaults'): Promise<PortalGlobalConfig | null> {
    const { data, error } = await this.supabase
      .from('portal_global_config')
      .select('*')
      .eq('config_type', configType)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get portal global config: ${error.message}`);
    }

    return this.mapRowToPortalGlobalConfig(data);
  }

  /**
   * Set Portal Global Config
   */
  async setPortalGlobalConfig(
    configType: 'tenant_defaults' | 'vendor_defaults' | 'system_defaults',
    configData: ConfigValue,
    updatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<PortalGlobalConfig> {
    // Check if config exists
    const existing = await this.getPortalGlobalConfig(configType);

    let config: PortalGlobalConfig;
    if (existing) {
      // Update existing
      const { data, error } = await this.supabase
        .from('portal_global_config')
        .update({
          config_data: configData,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update portal global config: ${error.message}`);
      }

      config = this.mapRowToPortalGlobalConfig(data);
    } else {
      // Create new
      const { data, error } = await this.supabase
        .from('portal_global_config')
        .insert({
          config_type: configType,
          config_data: configData,
          updated_by: updatedBy,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create portal global config: ${error.message}`);
      }

      config = this.mapRowToPortalGlobalConfig(data);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'portal_global_config',
      entity_id: config.id,
      action: existing ? 'update' : 'create',
      action_by: updatedBy,
      old_state: existing || null,
      new_state: config,
      workflow_state: {
        config_type: configType,
      },
      tenant_id: 'global', // Global config has no tenant
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return config;
  }

  /**
   * Get Tenant Config (from tenants.settings)
   */
  async getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('settings, updated_at')
      .eq('id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get tenant config: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      tenant_id: tenantId,
      config_data: (data.settings as ConfigValue) || {},
      updated_at: data.updated_at,
      updated_by: 'system', // TODO: Track who updated
    };
  }

  /**
   * Set Tenant Config
   */
  async setTenantConfig(
    tenantId: string,
    configData: ConfigValue,
    updatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<TenantConfig> {
    const existing = await this.getTenantConfig(tenantId);

    const { data, error } = await this.supabase
      .from('tenants')
      .update({
        settings: configData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenantId)
      .select('settings, updated_at')
      .single();

    if (error) {
      throw new Error(`Failed to update tenant config: ${error.message}`);
    }

    const config: TenantConfig = {
      tenant_id: tenantId,
      config_data: (data.settings as ConfigValue) || {},
      updated_at: data.updated_at,
      updated_by: updatedBy,
    };

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'tenant_config',
      entity_id: tenantId,
      action: existing ? 'update' : 'create',
      action_by: updatedBy,
      old_state: (existing?.config_data || null) as Record<string, unknown> | undefined,
      new_state: config.config_data as Record<string, unknown>,
      workflow_state: {
        tenant_id: tenantId,
      },
      tenant_id: tenantId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return config;
  }

  /**
   * Get Tenant User Admin Config
   */
  async getTenantUserAdminConfig(tenantId: string): Promise<TenantUserAdminConfig | null> {
    const { data, error } = await this.supabase
      .from('tenant_user_admin_config')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get tenant user admin config: ${error.message}`);
    }

    return this.mapRowToTenantUserAdminConfig(data);
  }

  /**
   * Set Tenant User Admin Config
   */
  async setTenantUserAdminConfig(
    tenantId: string,
    configData: ConfigValue,
    updatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<TenantUserAdminConfig> {
    const existing = await this.getTenantUserAdminConfig(tenantId);

    let config: TenantUserAdminConfig;
    if (existing) {
      const { data, error } = await this.supabase
        .from('tenant_user_admin_config')
        .update({
          config_data: configData,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy,
        })
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update tenant user admin config: ${error.message}`);
      }

      config = this.mapRowToTenantUserAdminConfig(data);
    } else {
      const { data, error } = await this.supabase
        .from('tenant_user_admin_config')
        .insert({
          tenant_id: tenantId,
          config_data: configData,
          updated_by: updatedBy,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create tenant user admin config: ${error.message}`);
      }

      config = this.mapRowToTenantUserAdminConfig(data);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'tenant_user_admin_config',
      entity_id: tenantId,
      action: existing ? 'update' : 'create',
      action_by: updatedBy,
      old_state: (existing?.config_data || null) as Record<string, unknown> | undefined,
      new_state: config.config_data as Record<string, unknown>,
      workflow_state: {
        tenant_id: tenantId,
      },
      tenant_id: tenantId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return config;
  }

  /**
   * Get Tenant User Personal Config
   */
  async getTenantUserPersonalConfig(tenantId: string, userId: string): Promise<TenantUserPersonalConfig | null> {
    const { data, error } = await this.supabase
      .from('tenant_user_personal_config')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get tenant user personal config: ${error.message}`);
    }

    return this.mapRowToTenantUserPersonalConfig(data);
  }

  /**
   * Set Tenant User Personal Config
   */
  async setTenantUserPersonalConfig(
    tenantId: string,
    userId: string,
    configData: ConfigValue,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<TenantUserPersonalConfig> {
    const existing = await this.getTenantUserPersonalConfig(tenantId, userId);

    let config: TenantUserPersonalConfig;
    if (existing) {
      const { data, error } = await this.supabase
        .from('tenant_user_personal_config')
        .update({
          config_data: configData,
          updated_at: new Date().toISOString(),
        })
        .eq('tenant_id', tenantId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update tenant user personal config: ${error.message}`);
      }

      config = this.mapRowToTenantUserPersonalConfig(data);
    } else {
      const { data, error } = await this.supabase
        .from('tenant_user_personal_config')
        .insert({
          tenant_id: tenantId,
          user_id: userId,
          config_data: configData,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create tenant user personal config: ${error.message}`);
      }

      config = this.mapRowToTenantUserPersonalConfig(data);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'tenant_user_personal_config',
      entity_id: `${tenantId}:${userId}`,
      action: existing ? 'update' : 'create',
      action_by: userId,
      old_state: (existing?.config_data || null) as Record<string, unknown> | undefined,
      new_state: config.config_data as Record<string, unknown>,
      workflow_state: {
        tenant_id: tenantId,
        user_id: userId,
      },
      tenant_id: tenantId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return config;
  }

  /**
   * Get Vendor Global Config
   */
  async getVendorGlobalConfig(vendorId: string): Promise<VendorGlobalConfig | null> {
    const { data, error } = await this.supabase
      .from('vendor_global_config')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get vendor global config: ${error.message}`);
    }

    return this.mapRowToVendorGlobalConfig(data);
  }

  /**
   * Set Vendor Global Config
   */
  async setVendorGlobalConfig(
    vendorId: string,
    configData: ConfigValue,
    updatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<VendorGlobalConfig> {
    const existing = await this.getVendorGlobalConfig(vendorId);

    let config: VendorGlobalConfig;
    if (existing) {
      const { data, error } = await this.supabase
        .from('vendor_global_config')
        .update({
          config_data: configData,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy,
        })
        .eq('vendor_id', vendorId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update vendor global config: ${error.message}`);
      }

      config = this.mapRowToVendorGlobalConfig(data);
    } else {
      const { data, error } = await this.supabase
        .from('vendor_global_config')
        .insert({
          vendor_id: vendorId,
          config_data: configData,
          updated_by: updatedBy,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create vendor global config: ${error.message}`);
      }

      config = this.mapRowToVendorGlobalConfig(data);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'vendor_global_config',
      entity_id: vendorId,
      action: existing ? 'update' : 'create',
      action_by: updatedBy,
      old_state: (existing?.config_data || null) as Record<string, unknown> | undefined,
      new_state: config.config_data as Record<string, unknown>,
      workflow_state: {
        vendor_id: vendorId,
      },
      tenant_id: 'global', // Vendor config may span tenants
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return config;
  }

  /**
   * Get Vendor User Personal Config
   */
  async getVendorUserPersonalConfig(vendorId: string, userId: string): Promise<VendorUserPersonalConfig | null> {
    const { data, error } = await this.supabase
      .from('vendor_user_personal_config')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get vendor user personal config: ${error.message}`);
    }

    return this.mapRowToVendorUserPersonalConfig(data);
  }

  /**
   * Set Vendor User Personal Config
   */
  async setVendorUserPersonalConfig(
    vendorId: string,
    userId: string,
    configData: ConfigValue,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<VendorUserPersonalConfig> {
    const existing = await this.getVendorUserPersonalConfig(vendorId, userId);

    let config: VendorUserPersonalConfig;
    if (existing) {
      const { data, error } = await this.supabase
        .from('vendor_user_personal_config')
        .update({
          config_data: configData,
          updated_at: new Date().toISOString(),
        })
        .eq('vendor_id', vendorId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update vendor user personal config: ${error.message}`);
      }

      config = this.mapRowToVendorUserPersonalConfig(data);
    } else {
      const { data, error } = await this.supabase
        .from('vendor_user_personal_config')
        .insert({
          vendor_id: vendorId,
          user_id: userId,
          config_data: configData,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create vendor user personal config: ${error.message}`);
      }

      config = this.mapRowToVendorUserPersonalConfig(data);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'vendor_user_personal_config',
      entity_id: `${vendorId}:${userId}`,
      action: existing ? 'update' : 'create',
      action_by: userId,
      old_state: (existing?.config_data || null) as Record<string, unknown> | undefined,
      new_state: config.config_data as Record<string, unknown>,
      workflow_state: {
        vendor_id: vendorId,
        user_id: userId,
      },
      tenant_id: 'global',
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return config;
  }

  /**
   * Resolve configuration for a tenant user (merges all levels)
   */
  async resolveTenantUserConfig(tenantId: string, userId: string): Promise<ResolvedConfig> {
    const sources: ResolvedConfig['sources'] = {};
    const config: ConfigValue = {};

    // 1. Portal Global (tenant defaults)
    const portalGlobal = await this.getPortalGlobalConfig('tenant_defaults');
    if (portalGlobal) {
      Object.assign(config, portalGlobal.config_data);
      sources.portal_global = true;
    }

    // 2. Tenant Config
    const tenantConfig = await this.getTenantConfig(tenantId);
    if (tenantConfig) {
      Object.assign(config, tenantConfig.config_data);
      sources.tenant = true;
    }

    // 3. Tenant User Admin Config
    const tenantUserAdmin = await this.getTenantUserAdminConfig(tenantId);
    if (tenantUserAdmin) {
      Object.assign(config, tenantUserAdmin.config_data);
      sources.tenant_user_admin = true;
    }

    // 4. Tenant User Personal Config (highest priority)
    const tenantUserPersonal = await this.getTenantUserPersonalConfig(tenantId, userId);
    if (tenantUserPersonal) {
      Object.assign(config, tenantUserPersonal.config_data);
      sources.tenant_user_personal = true;
    }

    return { config, sources };
  }

  /**
   * Resolve configuration for a vendor user (merges all levels)
   */
  async resolveVendorUserConfig(vendorId: string, userId: string): Promise<ResolvedConfig> {
    const sources: ResolvedConfig['sources'] = {};
    const config: ConfigValue = {};

    // 1. Portal Global (vendor defaults)
    const portalGlobal = await this.getPortalGlobalConfig('vendor_defaults');
    if (portalGlobal) {
      Object.assign(config, portalGlobal.config_data);
      sources.portal_global = true;
    }

    // 2. Vendor Global Config
    const vendorGlobal = await this.getVendorGlobalConfig(vendorId);
    if (vendorGlobal) {
      Object.assign(config, vendorGlobal.config_data);
      sources.vendor_global = true;
    }

    // 3. Vendor User Personal Config (highest priority)
    const vendorUserPersonal = await this.getVendorUserPersonalConfig(vendorId, userId);
    if (vendorUserPersonal) {
      Object.assign(config, vendorUserPersonal.config_data);
      sources.vendor_user_personal = true;
    }

    return { config, sources };
  }

  // Mapper functions
  private mapRowToPortalGlobalConfig(row: unknown): PortalGlobalConfig {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      config_type: r.config_type as 'tenant_defaults' | 'vendor_defaults' | 'system_defaults',
      config_data: (r.config_data as ConfigValue) || {},
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
      updated_by: r.updated_by as string,
    };
  }

  private mapRowToTenantUserAdminConfig(row: unknown): TenantUserAdminConfig {
    const r = row as Record<string, unknown>;
    return {
      tenant_id: r.tenant_id as string,
      config_data: (r.config_data as ConfigValue) || {},
      updated_at: r.updated_at as string,
      updated_by: r.updated_by as string,
    };
  }

  private mapRowToTenantUserPersonalConfig(row: unknown): TenantUserPersonalConfig {
    const r = row as Record<string, unknown>;
    return {
      tenant_id: r.tenant_id as string,
      user_id: r.user_id as string,
      config_data: (r.config_data as ConfigValue) || {},
      updated_at: r.updated_at as string,
    };
  }

  private mapRowToVendorGlobalConfig(row: unknown): VendorGlobalConfig {
    const r = row as Record<string, unknown>;
    return {
      vendor_id: r.vendor_id as string,
      config_data: (r.config_data as ConfigValue) || {},
      updated_at: r.updated_at as string,
      updated_by: r.updated_by as string,
    };
  }

  private mapRowToVendorUserPersonalConfig(row: unknown): VendorUserPersonalConfig {
    const r = row as Record<string, unknown>;
    return {
      vendor_id: r.vendor_id as string,
      user_id: r.user_id as string,
      config_data: (r.config_data as ConfigValue) || {},
      updated_at: r.updated_at as string,
    };
  }
}


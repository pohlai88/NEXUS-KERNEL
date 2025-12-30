/**
 * Configuration Resolver Service
 * 
 * Resolves configuration values with proper inheritance and merging.
 * Handles deep merging of nested objects and array handling.
 */

import { ConfigRepository, type ResolvedConfig, type ConfigValue } from '../repositories/config-repository';

export interface ConfigResolverOptions {
  /**
   * If true, deep merge nested objects. If false, replace entire objects.
   */
  deepMerge?: boolean;
  
  /**
   * How to handle arrays: 'replace' (use highest priority), 'merge' (combine), 'prepend' (add to front), 'append' (add to end)
   */
  arrayStrategy?: 'replace' | 'merge' | 'prepend' | 'append';
}

export class ConfigResolver {
  private configRepo = new ConfigRepository();

  /**
   * Resolve tenant user configuration with deep merging
   */
  async resolveTenantUserConfig(
    tenantId: string,
    userId: string,
    options?: ConfigResolverOptions
  ): Promise<ResolvedConfig> {
    const resolved = await this.configRepo.resolveTenantUserConfig(tenantId, userId);
    
    if (options?.deepMerge) {
      resolved.config = this.deepMergeConfig(resolved.config, options);
    }

    return resolved;
  }

  /**
   * Resolve vendor user configuration with deep merging
   */
  async resolveVendorUserConfig(
    vendorId: string,
    userId: string,
    options?: ConfigResolverOptions
  ): Promise<ResolvedConfig> {
    const resolved = await this.configRepo.resolveVendorUserConfig(vendorId, userId);
    
    if (options?.deepMerge) {
      resolved.config = this.deepMergeConfig(resolved.config, options);
    }

    return resolved;
  }

  /**
   * Get a specific config value with fallback chain
   */
  async getConfigValue<T = unknown>(
    tenantId: string | null,
    userId: string | null,
    vendorId: string | null,
    key: string,
    defaultValue?: T
  ): Promise<T> {
    let resolved: ResolvedConfig;

    if (tenantId && userId) {
      // Tenant user
      resolved = await this.resolveTenantUserConfig(tenantId, userId);
    } else if (vendorId && userId) {
      // Vendor user
      resolved = await this.resolveVendorUserConfig(vendorId, userId);
    } else if (tenantId) {
      // Tenant-level only
      const tenantConfig = await this.configRepo.getTenantConfig(tenantId);
      resolved = {
        config: tenantConfig?.config_data || {},
        sources: { tenant: !!tenantConfig },
      };
    } else {
      // Portal global only
      const portalGlobal = await this.configRepo.getPortalGlobalConfig('system_defaults');
      resolved = {
        config: portalGlobal?.config_data || {},
        sources: { portal_global: !!portalGlobal },
      };
    }

    // Navigate nested keys (e.g., "payment.auto_payment_enabled")
    const keys = key.split('.');
    let value: unknown = resolved.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return defaultValue as T;
      }
    }

    return (value as T) ?? (defaultValue as T);
  }

  /**
   * Deep merge configuration objects
   */
  private deepMergeConfig(config: ConfigValue, options: ConfigResolverOptions): ConfigValue {
    // For now, return as-is since we're already merging in the repository
    // This can be enhanced for more complex merging strategies
    return config;
  }
}


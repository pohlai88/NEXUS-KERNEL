/**
 * Portal Global Configuration Page
 * 
 * Allows portal admins to configure system-wide defaults for:
 * - Tenant defaults
 * - Vendor defaults
 * - System defaults
 */

import { ConfigRepository } from '@/src/repositories/config-repository';

function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: null,
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export default async function PortalGlobalConfigPage() {
  const ctx = getRequestContext();
  const configRepo = new ConfigRepository();

  // Get all portal global configs
  const [tenantDefaults, vendorDefaults, systemDefaults] = await Promise.all([
    configRepo.getPortalGlobalConfig('tenant_defaults'),
    configRepo.getPortalGlobalConfig('vendor_defaults'),
    configRepo.getPortalGlobalConfig('system_defaults'),
  ]);

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-2">Portal Global Configuration</h1>
        <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted">
          System-wide defaults that apply to all tenants and vendors. These are the base configuration
          that all other levels inherit from.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tenant Defaults */}
        <div className="card p-6">
          <h2 className="section mb-4">Tenant Defaults</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted mb-4">
            Default configuration for all tenants. Can be overridden by tenant admins.
          </p>
          <div className="bg-nx-surface-well p-4 rounded mb-4">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(tenantDefaults?.config_data || {}, null, 2)}
            </pre>
          </div>
          <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">Edit Tenant Defaults</button>
        </div>

        {/* Vendor Defaults */}
        <div className="card p-6">
          <h2 className="section mb-4">Vendor Defaults</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted mb-4">
            Default configuration for all vendors. Can be overridden by vendor admins.
          </p>
          <div className="bg-nx-surface-well p-4 rounded mb-4">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(vendorDefaults?.config_data || {}, null, 2)}
            </pre>
          </div>
          <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">Edit Vendor Defaults</button>
        </div>

        {/* System Defaults */}
        <div className="card p-6">
          <h2 className="section mb-4">System Defaults</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted mb-4">
            Core system configuration that applies globally.
          </p>
          <div className="bg-nx-surface-well p-4 rounded mb-4">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(systemDefaults?.config_data || {}, null, 2)}
            </pre>
          </div>
          <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">Edit System Defaults</button>
        </div>
      </div>

      <div className="mt-8 card p-6 bg-nx-surface-well">
        <h3 className="text-base font-semibold text-nx-text-main mb-4">Configuration Hierarchy</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">1. Portal Global</span>
            <span className="text-nx-text-muted">(Lowest Priority - System Defaults)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">2. Tenant Config</span>
            <span className="text-nx-text-muted">(Tenant Admin Override)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">3. Tenant User Admin</span>
            <span className="text-nx-text-muted">(Admin-set User Defaults)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">4. User Personal</span>
            <span className="text-nx-text-muted">(Highest Priority - User Preferences)</span>
          </div>
        </div>
      </div>
    </div>
  );
}


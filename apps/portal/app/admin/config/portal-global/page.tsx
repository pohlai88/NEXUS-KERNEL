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
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-mb-8">
        <h1 className="na-h1 na-mb-2">Portal Global Configuration</h1>
        <p className="na-body na-text-muted">
          System-wide defaults that apply to all tenants and vendors. These are the base configuration
          that all other levels inherit from.
        </p>
      </div>

      <div className="na-space-y-6">
        {/* Tenant Defaults */}
        <div className="na-card na-p-6">
          <h2 className="na-h3 na-mb-4">Tenant Defaults</h2>
          <p className="na-body na-text-muted na-mb-4">
            Default configuration for all tenants. Can be overridden by tenant admins.
          </p>
          <div className="na-bg-muted na-p-4 na-rounded na-mb-4">
            <pre className="na-text-sm na-overflow-auto">
              {JSON.stringify(tenantDefaults?.config_data || {}, null, 2)}
            </pre>
          </div>
          <button className="na-btn na-btn-primary">Edit Tenant Defaults</button>
        </div>

        {/* Vendor Defaults */}
        <div className="na-card na-p-6">
          <h2 className="na-h3 na-mb-4">Vendor Defaults</h2>
          <p className="na-body na-text-muted na-mb-4">
            Default configuration for all vendors. Can be overridden by vendor admins.
          </p>
          <div className="na-bg-muted na-p-4 na-rounded na-mb-4">
            <pre className="na-text-sm na-overflow-auto">
              {JSON.stringify(vendorDefaults?.config_data || {}, null, 2)}
            </pre>
          </div>
          <button className="na-btn na-btn-primary">Edit Vendor Defaults</button>
        </div>

        {/* System Defaults */}
        <div className="na-card na-p-6">
          <h2 className="na-h3 na-mb-4">System Defaults</h2>
          <p className="na-body na-text-muted na-mb-4">
            Core system configuration that applies globally.
          </p>
          <div className="na-bg-muted na-p-4 na-rounded na-mb-4">
            <pre className="na-text-sm na-overflow-auto">
              {JSON.stringify(systemDefaults?.config_data || {}, null, 2)}
            </pre>
          </div>
          <button className="na-btn na-btn-primary">Edit System Defaults</button>
        </div>
      </div>

      <div className="na-mt-8 na-card na-p-6 na-bg-muted">
        <h3 className="na-h4 na-mb-4">Configuration Hierarchy</h3>
        <div className="na-space-y-2 na-text-sm">
          <div className="na-flex na-items-center na-gap-2">
            <span className="na-font-medium">1. Portal Global</span>
            <span className="na-text-muted">(Lowest Priority - System Defaults)</span>
          </div>
          <div className="na-flex na-items-center na-gap-2">
            <span className="na-font-medium">2. Tenant Config</span>
            <span className="na-text-muted">(Tenant Admin Override)</span>
          </div>
          <div className="na-flex na-items-center na-gap-2">
            <span className="na-font-medium">3. Tenant User Admin</span>
            <span className="na-text-muted">(Admin-set User Defaults)</span>
          </div>
          <div className="na-flex na-items-center na-gap-2">
            <span className="na-font-medium">4. User Personal</span>
            <span className="na-text-muted">(Highest Priority - User Preferences)</span>
          </div>
        </div>
      </div>
    </div>
  );
}


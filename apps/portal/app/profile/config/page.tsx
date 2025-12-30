/**
 * User Profile Configuration Page
 * 
 * Allows users to configure their personal preferences.
 * These override all other config levels.
 */

import { ConfigRepository } from '@/src/repositories/config-repository';
import { ConfigResolver } from '@/src/services/config-resolver';

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

interface ProfileConfigPageProps {
  searchParams: {
    tenant_id?: string;
    vendor_id?: string;
  };
}

export default async function ProfileConfigPage({ searchParams }: ProfileConfigPageProps) {
  const ctx = getRequestContext();
  const configRepo = new ConfigRepository();
  const configResolver = new ConfigResolver();

  const tenantId = searchParams.tenant_id || ctx.actor.tenantId;
  const vendorId = searchParams.vendor_id;

  let resolvedConfig;
  let personalConfig;

  if (tenantId && ctx.actor.userId) {
    // Tenant user
    resolvedConfig = await configResolver.resolveTenantUserConfig(tenantId, ctx.actor.userId);
    personalConfig = await configRepo.getTenantUserPersonalConfig(tenantId, ctx.actor.userId);
  } else if (vendorId && ctx.actor.userId) {
    // Vendor user
    resolvedConfig = await configResolver.resolveVendorUserConfig(vendorId, ctx.actor.userId);
    personalConfig = await configRepo.getVendorUserPersonalConfig(vendorId, ctx.actor.userId);
  }

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-mb-8">
        <h1 className="na-h1 na-mb-2">My Preferences</h1>
        <p className="na-body na-text-muted">
          Configure your personal preferences. These override all other configuration levels.
        </p>
      </div>

      {resolvedConfig && (
        <div className="na-space-y-6">
          {/* Resolved Config (Read-only) */}
          <div className="na-card na-p-6">
            <h2 className="na-h3 na-mb-4">Current Configuration</h2>
            <p className="na-body na-text-muted na-mb-4">
              Your resolved configuration (merged from all levels):
            </p>
            <div className="na-bg-muted na-p-4 na-rounded na-mb-4">
              <pre className="na-text-sm na-overflow-auto">
                {JSON.stringify(resolvedConfig.config, null, 2)}
              </pre>
            </div>
            <div className="na-text-sm na-text-muted">
              <p className="na-mb-2">Sources:</p>
              <ul className="na-list-disc na-list-inside na-space-y-1">
                {resolvedConfig.sources.portal_global && <li>Portal Global</li>}
                {resolvedConfig.sources.tenant && <li>Tenant</li>}
                {resolvedConfig.sources.tenant_user_admin && <li>Tenant User Admin</li>}
                {resolvedConfig.sources.tenant_user_personal && <li>Your Personal</li>}
                {resolvedConfig.sources.vendor_global && <li>Vendor Global</li>}
                {resolvedConfig.sources.vendor_user_personal && <li>Your Personal</li>}
              </ul>
            </div>
          </div>

          {/* Personal Config (Editable) */}
          <div className="na-card na-p-6">
            <h2 className="na-h3 na-mb-4">Personal Preferences</h2>
            <p className="na-body na-text-muted na-mb-4">
              Your personal configuration that overrides all other levels.
            </p>
            <div className="na-bg-muted na-p-4 na-rounded na-mb-4">
              <pre className="na-text-sm na-overflow-auto">
                {JSON.stringify(personalConfig?.config_data || {}, null, 2)}
              </pre>
            </div>
            <button className="na-btn na-btn-primary">Edit Personal Preferences</button>
          </div>
        </div>
      )}

      {!resolvedConfig && (
        <div className="na-card na-p-6">
          <p className="na-body">Please select a tenant or vendor to view configuration.</p>
        </div>
      )}
    </div>
  );
}


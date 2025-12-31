/**
 * Tenant Configuration Page
 *
 * Allows tenant admins to configure tenant-level settings.
 * These override portal global defaults.
 */

import { getRequestContext } from "@/lib/dev-auth-context";
import { ConfigRepository } from "@/src/repositories/config-repository";
import { TenantAccessRepository } from "@/src/repositories/tenant-access-repository";

interface TenantConfigPageProps {
  searchParams: Promise<{
    tenant_id?: string;
  }>;
}

export default async function TenantConfigPage({
  searchParams,
}: TenantConfigPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const configRepo = new ConfigRepository();
  const tenantAccessRepo = new TenantAccessRepository();

  // Get accessible tenants
  const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(
    ctx.actor.userId
  );
  const selectedTenantId = params.tenant_id || accessibleTenants[0]?.tenant_id;

  if (!selectedTenantId) {
    return (
      <div className="na-container na-mx-auto na-p-6">
        <div className="na-card na-p-6">
          <p className="na-body">No tenants accessible.</p>
        </div>
      </div>
    );
  }

  // Get tenant config
  const tenantConfig = await configRepo.getTenantConfig(selectedTenantId);
  const tenantUserAdminConfig = await configRepo.getTenantUserAdminConfig(
    selectedTenantId
  );

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-mb-8">
        <h1 className="na-h1 na-mb-2">Tenant Configuration</h1>
        <p className="na-body na-text-muted">
          Configure tenant-level settings. These override portal global defaults
          and apply to all users in this tenant.
        </p>
      </div>

      {/* Tenant Selector */}
      <div className="na-card na-p-4 na-mb-6">
        <label className="na-label na-mb-2">Select Tenant</label>
        <select className="na-input" defaultValue={selectedTenantId}>
          {accessibleTenants.map((tenant) => (
            <option key={tenant.tenant_id} value={tenant.tenant_id}>
              {tenant.tenant_id}
            </option>
          ))}
        </select>
      </div>

      <div className="na-space-y-6">
        {/* Tenant Config */}
        <div className="na-card na-p-6">
          <h2 className="na-h3 na-mb-4">Tenant Settings</h2>
          <p className="na-body na-text-muted na-mb-4">
            Configuration that applies to all users in this tenant.
          </p>
          <div className="na-bg-muted na-p-4 na-rounded na-mb-4">
            <pre className="na-text-sm na-overflow-auto">
              {JSON.stringify(tenantConfig?.config_data || {}, null, 2)}
            </pre>
          </div>
          <button className="na-btn na-btn-primary">
            Edit Tenant Settings
          </button>
        </div>

        {/* Tenant User Admin Config */}
        <div className="na-card na-p-6">
          <h2 className="na-h3 na-mb-4">Tenant User Admin Defaults</h2>
          <p className="na-body na-text-muted na-mb-4">
            Admin-set defaults for all tenant users. Users can override these
            with personal preferences.
          </p>
          <div className="na-bg-muted na-p-4 na-rounded na-mb-4">
            <pre className="na-text-sm na-overflow-auto">
              {JSON.stringify(
                tenantUserAdminConfig?.config_data || {},
                null,
                2
              )}
            </pre>
          </div>
          <button className="na-btn na-btn-primary">
            Edit User Admin Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

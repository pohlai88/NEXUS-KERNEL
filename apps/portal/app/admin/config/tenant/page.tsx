/**
 * Tenant Configuration Page
 * 
 * Allows tenant admins to configure tenant-level settings.
 * These override portal global defaults.
 */

import { ConfigRepository } from '@/src/repositories/config-repository';
import { TenantAccessRepository } from '@/src/repositories/tenant-access-repository';

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

interface TenantConfigPageProps {
  searchParams: {
    tenant_id?: string;
  };
}

export default async function TenantConfigPage({ searchParams }: TenantConfigPageProps) {
  const ctx = getRequestContext();
  const configRepo = new ConfigRepository();
  const tenantAccessRepo = new TenantAccessRepository();

  // Get accessible tenants
  const accessibleTenants = await tenantAccessRepo.getAccessibleTenants(ctx.actor.userId);
  const selectedTenantId = searchParams.tenant_id || accessibleTenants[0]?.tenant_id;

  if (!selectedTenantId) {
    return (
      <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
        <div className="card p-6">
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">No tenants accessible.</p>
        </div>
      </div>
    );
  }

  // Get tenant config
  const tenantConfig = await configRepo.getTenantConfig(selectedTenantId);
  const tenantUserAdminConfig = await configRepo.getTenantUserAdminConfig(selectedTenantId);

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main mb-2">Tenant Configuration</h1>
        <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted">
          Configure tenant-level settings. These override portal global defaults and apply to all users in this tenant.
        </p>
      </div>

      {/* Tenant Selector */}
      <div className="card p-4 mb-6">
        <label className="caption font-semibold mb-2">Select Tenant</label>
        <select className="input" defaultValue={selectedTenantId}>
          {accessibleTenants.map((tenant) => (
            <option key={tenant.tenant_id} value={tenant.tenant_id}>
              {tenant.tenant_id}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-6">
        {/* Tenant Config */}
        <div className="card p-6">
          <h2 className="section mb-4">Tenant Settings</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted mb-4">
            Configuration that applies to all users in this tenant.
          </p>
          <div className="bg-nx-surface-well p-4 rounded mb-4">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(tenantConfig?.config_data || {}, null, 2)}
            </pre>
          </div>
          <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">Edit Tenant Settings</button>
        </div>

        {/* Tenant User Admin Config */}
        <div className="card p-6">
          <h2 className="section mb-4">Tenant User Admin Defaults</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-nx-text-muted mb-4">
            Admin-set defaults for all tenant users. Users can override these with personal preferences.
          </p>
          <div className="bg-nx-surface-well p-4 rounded mb-4">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(tenantUserAdminConfig?.config_data || {}, null, 2)}
            </pre>
          </div>
          <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary">Edit User Admin Defaults</button>
        </div>
      </div>
    </div>
  );
}


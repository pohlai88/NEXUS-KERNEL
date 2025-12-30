/**
 * Context Switcher Component
 *
 * Omni-Dashboard: Switch between "All Companies" vs "Subsidiary A" vs "Subsidiary B"
 * Zero logging out - single sign-on with context switching.
 */

'use client';

import { useState, useEffect } from 'react';
import { TenantAccessRepository, type TenantAccess } from '@/src/repositories/tenant-access-repository';

interface ContextSwitcherProps {
  currentTenantId: string | null;
  onTenantChange: (tenantId: string | null) => void;
  userId: string;
}

export function ContextSwitcher({ currentTenantId, onTenantChange, userId }: ContextSwitcherProps) {
  const [accessibleTenants, setAccessibleTenants] = useState<TenantAccess[]>([]);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const tenantAccessRepo = new TenantAccessRepository();
        const access = await tenantAccessRepo.getAccessibleTenants(userId);
        setAccessibleTenants(access);

        // Fetch tenant names
        const { data, error } = await fetch('/api/tenants', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then((res) => res.json());

        if (data) {
          setTenants(data);
        }
      } catch (error) {
        console.error('Failed to load tenants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTenants();
  }, [userId]);

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.name || tenantId.slice(0, 8);
  };

  if (loading) {
    return (
      <div className="na-card na-p-4">
        <div className="na-spinner na-spinner-sm"></div>
      </div>
    );
  }

  return (
    <div className="na-card na-p-4 na-flex na-items-center na-gap-4">
      <label className="na-metadata">View:</label>
      <select
        value={currentTenantId || 'all'}
        onChange={(e) => {
          const value = e.target.value;
          onTenantChange(value === 'all' ? null : value);
        }}
        className="na-input"
      >
        <option value="all">All Companies ({accessibleTenants.length})</option>
        {accessibleTenants.map((access) => (
          <option key={access.tenant_id} value={access.tenant_id}>
            {getTenantName(access.tenant_id)} ({access.role})
          </option>
        ))}
      </select>
      <span className="na-metadata na-text-sm">
        {currentTenantId ? `Viewing: ${getTenantName(currentTenantId)}` : 'Viewing: All Companies'}
      </span>
    </div>
  );
}


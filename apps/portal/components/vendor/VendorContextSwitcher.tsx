/**
 * Vendor Context Switcher Component
 * 
 * Vendor Omni-Dashboard: Switch between "All Subsidiaries" vs "Subsidiary A" vs "Subsidiary B"
 * Vendors can see all their work across subsidiaries they serve.
 */

'use client';

import { useState, useEffect } from 'react';
import { VendorGroupRepository, type VendorGroupAccess } from '@/src/repositories/vendor-group-repository';

interface VendorContextSwitcherProps {
  currentTenantId: string | null;
  onTenantChange: (tenantId: string | null) => void;
  userId: string;
}

export function VendorContextSwitcher({ currentTenantId, onTenantChange, userId }: VendorContextSwitcherProps) {
  const [accessibleSubsidiaries, setAccessibleSubsidiaries] = useState<VendorGroupAccess[]>([]);
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubsidiaries = async () => {
      try {
        const vendorGroupRepo = new VendorGroupRepository();
        const subsidiaries = await vendorGroupRepo.getAccessibleSubsidiaries(userId);
        setAccessibleSubsidiaries(subsidiaries);

        // Fetch tenant names
        const tenantIds = subsidiaries.map((s) => s.tenant_id);
        if (tenantIds.length > 0) {
          const response = await fetch(`/api/tenants?ids=${tenantIds.join(',')}`);
          const { data } = await response.json();
          if (data) {
            setTenants(data);
          }
        }
      } catch (error) {
        console.error('Failed to load subsidiaries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubsidiaries();
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
        <option value="all">All Subsidiaries ({accessibleSubsidiaries.length})</option>
        {accessibleSubsidiaries.map((access) => (
          <option key={access.tenant_id} value={access.tenant_id}>
            {getTenantName(access.tenant_id)} ({access.access_type})
          </option>
        ))}
      </select>
      <span className="na-metadata na-text-sm">
        {currentTenantId ? `Viewing: ${getTenantName(currentTenantId)}` : 'Viewing: All Subsidiaries'}
      </span>
    </div>
  );
}


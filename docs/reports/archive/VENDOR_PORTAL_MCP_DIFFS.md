# Vendor Portal Design Spec - MCP Recommended Diffs

**Date:** 2025-12-30  
**Source:** VENDOR_PORTAL_MCP_AUDIT.md  
**Purpose:** Specific code diffs for implementation

---

## 📝 Diff 1: Server Actions Pattern (P0 - Critical)

### File: `apps/portal/app/vendors/actions.ts` (NEW)

```typescript
'use server';

import { redirect } from 'next/navigation';
import { vendorCRUD } from '@/src/cruds/vendor-crud';
import { validateVendorPayload } from '@nexus/kernel';
import { revalidatePath } from 'next/cache';

export async function createVendorAction(formData: FormData) {
  try {
    const payload = {
      legal_name: formData.get('legal_name') as string,
      display_name: formData.get('display_name') as string || undefined,
      country_code: formData.get('country_code') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      status: (formData.get('status') as string) || 'PENDING',
      official_aliases: [], // TODO: Parse from form
    };

    const validated = validateVendorPayload(payload);
    const vendor = await vendorCRUD.create(validated);

    revalidatePath('/vendors');
    redirect(`/vendors/${vendor.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create vendor',
    };
  }
}

export async function updateVendorAction(
  id: string,
  formData: FormData
) {
  try {
    const payload = {
      legal_name: formData.get('legal_name') as string,
      display_name: formData.get('display_name') as string || undefined,
      country_code: formData.get('country_code') as string,
      email: formData.get('email') as string || undefined,
      phone: formData.get('phone') as string || undefined,
      status: formData.get('status') as string,
      official_aliases: [], // TODO: Parse from form
    };

    const validated = validateVendorPayload(payload);
    await vendorCRUD.update(id, validated);

    revalidatePath('/vendors');
    revalidatePath(`/vendors/${id}`);
    redirect(`/vendors/${id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update vendor',
    };
  }
}

export async function updateVendorFieldAction(
  id: string,
  field: string,
  value: string
) {
  try {
    const vendor = await vendorCRUD.get(id);
    const updated = { ...vendor, [field]: value };
    const validated = validateVendorPayload(updated);
    await vendorCRUD.update(id, validated);

    revalidatePath('/vendors');
    revalidatePath(`/vendors/${id}`);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update field',
    };
  }
}

export async function deleteVendorAction(id: string) {
  try {
    await vendorCRUD.softDelete(id);
    revalidatePath('/vendors');
    redirect('/vendors');
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete vendor',
    };
  }
}
```

---

## 📝 Diff 2: Inline Editing Component (P0 - Silent Killer)

### File: `apps/portal/components/vendors/VendorInlineEdit.tsx` (NEW)

```typescript
'use client';

import { useState, useTransition } from 'react';
import { updateVendorFieldAction } from '@/app/vendors/actions';

interface VendorInlineEditProps {
  vendorId: string;
  field: string;
  value: string;
  type?: 'text' | 'email' | 'tel' | 'select';
  options?: string[];
}

export function VendorInlineEdit({
  vendorId,
  field,
  value,
  type = 'text',
  options,
}: VendorInlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateVendorFieldAction(vendorId, field, editValue);
        if (result.error) {
          setError(result.error);
          setEditValue(value); // Rollback
        } else {
          setIsEditing(false);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
        setEditValue(value); // Rollback
      }
    });
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  if (isEditing) {
    return (
      <td className="na-td">
        {type === 'select' && options ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            className="na-input"
            autoFocus
            disabled={isPending}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="na-input"
            autoFocus
            disabled={isPending}
          />
        )}
        {error && (
          <span className="na-text-danger na-text-sm">{error}</span>
        )}
      </td>
    );
  }

  return (
    <td
      className="na-td na-cursor-pointer na-hover-bg-paper-2 na-transition-colors"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || <span className="na-metadata">—</span>}
    </td>
  );
}
```

---

## 📝 Diff 3: Schema Mapping Layer (P0 - Critical)

### File: `apps/portal/src/repositories/vendor-mapper.ts` (NEW)

```typescript
import { VendorPayload } from '@nexus/kernel';

// Database schema (vmp_vendors table)
interface DatabaseVendor {
  id: string;
  tenant_id: string;
  name: string; // Maps to legal_name
  display_name?: string;
  country_code?: string;
  email?: string;
  phone?: string;
  status: 'invited' | 'active' | 'suspended';
  official_aliases?: string; // JSONB stored as string
  created_at: string;
  updated_at: string;
}

// Map Kernel schema to Database schema
export function mapKernelToDatabase(
  kernel: VendorPayload,
  tenantId: string
): Omit<DatabaseVendor, 'id' | 'created_at' | 'updated_at'> {
  return {
    tenant_id: tenantId,
    name: kernel.legal_name, // Map legal_name → name
    display_name: kernel.display_name,
    country_code: kernel.country_code,
    email: kernel.email,
    phone: kernel.phone,
    status: mapKernelStatusToDatabase(kernel.status),
    official_aliases: JSON.stringify(kernel.official_aliases || []),
  };
}

// Map Database schema to Kernel schema
export function mapDatabaseToKernel(db: DatabaseVendor): VendorPayload & { id: string } {
  return {
    id: db.id,
    legal_name: db.name, // Map name → legal_name
    display_name: db.display_name,
    country_code: db.country_code || '',
    email: db.email,
    phone: db.phone,
    status: mapDatabaseStatusToKernel(db.status),
    official_aliases: db.official_aliases
      ? JSON.parse(db.official_aliases)
      : [],
  };
}

function mapKernelStatusToDatabase(status: string): 'invited' | 'active' | 'suspended' {
  const mapping: Record<string, 'invited' | 'active' | 'suspended'> = {
    PENDING: 'invited',
    SUBMITTED: 'invited',
    APPROVED: 'active',
    REJECTED: 'invited', // TODO: Add 'rejected' status to database
    SUSPENDED: 'suspended',
  };
  return mapping[status] || 'invited';
}

function mapDatabaseStatusToKernel(
  status: string
): 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' {
  const mapping: Record<string, 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'> = {
    invited: 'PENDING',
    active: 'APPROVED',
    suspended: 'SUSPENDED',
  };
  return mapping[status] || 'PENDING';
}
```

---

## 📝 Diff 4: Vendor Repository with RLS (P0)

### File: `apps/portal/src/repositories/vendor-repository.ts` (NEW)

```typescript
import { createClient } from '@/lib/supabase-client';
import { VendorPayload } from '@nexus/kernel';
import {
  mapKernelToDatabase,
  mapDatabaseToKernel,
  type DatabaseVendor,
} from './vendor-mapper';

export interface VendorFilters {
  status?: string;
  search?: string;
  country_code?: string;
}

export class VendorRepository {
  private supabase = createClient();

  async list(filters?: VendorFilters): Promise<(VendorPayload & { id: string })[]> {
    let query = this.supabase
      .from('vmp_vendors')
      .select('*')
      .order('created_at', { ascending: false });

    // RLS automatically filters by tenant_id
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.country_code) {
      query = query.eq('country_code', filters.country_code);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,display_name.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list vendors: ${error.message}`);
    }

    return (data || []).map(mapDatabaseToKernel);
  }

  async get(id: string): Promise<VendorPayload & { id: string }> {
    // RLS automatically checks tenant access
    const { data, error } = await this.supabase
      .from('vmp_vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Vendor not found');
      }
      throw new Error(`Failed to get vendor: ${error.message}`);
    }

    return mapDatabaseToKernel(data);
  }

  async create(
    payload: VendorPayload,
    tenantId: string
  ): Promise<VendorPayload & { id: string }> {
    const dbPayload = mapKernelToDatabase(payload, tenantId);

    const { data, error } = await this.supabase
      .from('vmp_vendors')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create vendor: ${error.message}`);
    }

    return mapDatabaseToKernel(data);
  }

  async update(
    id: string,
    payload: Partial<VendorPayload>,
    tenantId: string
  ): Promise<VendorPayload & { id: string }> {
    // Get existing vendor to merge
    const existing = await this.get(id);
    const merged = { ...existing, ...payload };
    const dbPayload = mapKernelToDatabase(merged, tenantId);

    const { data, error } = await this.supabase
      .from('vmp_vendors')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update vendor: ${error.message}`);
    }

    return mapDatabaseToKernel(data);
  }

  async softDelete(id: string): Promise<void> {
    // TODO: Add deleted_at column to vmp_vendors table
    // For now, update status to 'suspended'
    const { error } = await this.supabase
      .from('vmp_vendors')
      .update({ status: 'suspended' })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete vendor: ${error.message}`);
    }
  }
}
```

---

## 📝 Diff 5: Real-Time Table Component (P1)

### File: `apps/portal/components/vendors/VendorTable.tsx` (NEW)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { VendorInlineEdit } from './VendorInlineEdit';
import type { VendorPayload } from '@nexus/kernel';

interface Vendor extends VendorPayload {
  id: string;
}

interface VendorTableProps {
  initialVendors: Vendor[];
}

export function VendorTable({ initialVendors }: VendorTableProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to vendor changes
    const channel = supabase
      .channel('vendors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vmp_vendors',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // TODO: Map database to kernel schema
            setVendors((prev) => [...prev, payload.new as Vendor]);
          } else if (payload.eventType === 'UPDATE') {
            setVendors((prev) =>
              prev.map((v) =>
                v.id === payload.new.id ? (payload.new as Vendor) : v
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setVendors((prev) => prev.filter((v) => v.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="na-card na-p-6">
      <table className="na-table-frozen">
        <thead>
          <tr>
            <th className="na-th">Legal Name</th>
            <th className="na-th">Display Name</th>
            <th className="na-th">Country</th>
            <th className="na-th">Email</th>
            <th className="na-th">Phone</th>
            <th className="na-th">Status</th>
            <th className="na-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id}>
              <VendorInlineEdit
                vendorId={vendor.id}
                field="legal_name"
                value={vendor.legal_name}
              />
              <VendorInlineEdit
                vendorId={vendor.id}
                field="display_name"
                value={vendor.display_name || ''}
              />
              <VendorInlineEdit
                vendorId={vendor.id}
                field="country_code"
                value={vendor.country_code}
              />
              <VendorInlineEdit
                vendorId={vendor.id}
                field="email"
                value={vendor.email || ''}
                type="email"
              />
              <VendorInlineEdit
                vendorId={vendor.id}
                field="phone"
                value={vendor.phone || ''}
                type="tel"
              />
              <td className="na-td">
                <span className={`na-status na-status-${vendor.status.toLowerCase()}`}>
                  {vendor.status}
                </span>
              </td>
              <td className="na-td">
                <a
                  href={`/vendors/${vendor.id}`}
                  className="na-btn na-btn-ghost na-text-sm"
                >
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 📝 Diff 6: Optimistic Status Badge (P1)

### File: `apps/portal/components/vendors/VendorStatusBadge.tsx` (NEW)

```typescript
'use client';

import { useOptimistic, useTransition } from 'react';
import { updateVendorFieldAction } from '@/app/vendors/actions';

interface VendorStatusBadgeProps {
  vendorId: string;
  status: string;
}

const statusOptions = ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'SUSPENDED'];

export function VendorStatusBadge({ vendorId, status }: VendorStatusBadgeProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    status,
    (currentStatus, newStatus: string) => newStatus
  );

  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === optimisticStatus) return;

    // Optimistic update
    setOptimisticStatus(newStatus);

    startTransition(async () => {
      try {
        const result = await updateVendorFieldAction(vendorId, 'status', newStatus);
        if (result.error) {
          // Rollback on error
          setOptimisticStatus(status);
          alert(result.error);
        }
      } catch (error) {
        // Rollback on error
        setOptimisticStatus(status);
        alert(error instanceof Error ? error.message : 'Failed to update status');
      }
    });
  };

  return (
    <select
      value={optimisticStatus}
      onChange={(e) => handleStatusChange(e.target.value)}
      className={`na-status na-status-${optimisticStatus.toLowerCase()}`}
      disabled={isPending}
    >
      {statusOptions.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
```

---

## 📝 Diff 7: Server Component List Page (P0)

### File: `apps/portal/app/vendors/page.tsx` (NEW)

```typescript
import { vendorCRUD } from '@/src/cruds/vendor-crud';
import { VendorTable } from '@/components/vendors/VendorTable';

interface VendorsPageProps {
  searchParams: {
    status?: string;
    search?: string;
    country?: string;
  };
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const vendors = await vendorCRUD.list({
    status: searchParams.status,
    search: searchParams.search,
    country_code: searchParams.country,
  });

  return (
    <div className="na-shell-main na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Vendors</h1>
        <a
          href="/vendors/new"
          className="na-btn na-btn-primary"
        >
          Create Vendor
        </a>
      </div>

      {vendors.length === 0 ? (
        <div className="na-card na-p-6">
          <h2 className="na-h4">No Vendors Found</h2>
          <p className="na-data na-mb-4">
            No vendors have been created yet. Create your first vendor to get started.
          </p>
          <a href="/vendors/new" className="na-btn na-btn-primary">
            Create First Vendor
          </a>
        </div>
      ) : (
        <VendorTable initialVendors={vendors} />
      )}
    </div>
  );
}
```

---

## 📝 Diff 8: Loading State (P1)

### File: `apps/portal/app/vendors/loading.tsx` (NEW)

```typescript
export default function VendorsLoading() {
  return (
    <div className="na-shell-main na-p-6">
      <div className="na-card na-p-6">
        <div className="na-flex na-items-center na-gap-4">
          <div className="na-spinner" />
          <p className="na-metadata">Loading vendors...</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 Diff 9: Error Boundary (P1)

### File: `apps/portal/app/vendors/error.tsx` (NEW)

```typescript
'use client';

import { useEffect } from 'react';

export default function VendorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Vendors page error:', error);
  }, [error]);

  return (
    <div className="na-shell-main na-p-6">
      <div className="na-card na-p-6">
        <h2 className="na-h2 na-text-danger">Something went wrong!</h2>
        <p className="na-data na-mb-4">{error.message}</p>
        <button className="na-btn na-btn-primary" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
```

---

## ✅ Implementation Checklist

- [ ] Create `apps/portal/app/vendors/actions.ts` (Server Actions)
- [ ] Create `apps/portal/components/vendors/VendorInlineEdit.tsx` (Inline editing)
- [ ] Create `apps/portal/src/repositories/vendor-mapper.ts` (Schema mapping)
- [ ] Create `apps/portal/src/repositories/vendor-repository.ts` (Repository with RLS)
- [ ] Create `apps/portal/components/vendors/VendorTable.tsx` (Real-time table)
- [ ] Create `apps/portal/components/vendors/VendorStatusBadge.tsx` (Optimistic status)
- [ ] Create `apps/portal/app/vendors/page.tsx` (Server Component list)
- [ ] Create `apps/portal/app/vendors/loading.tsx` (Loading state)
- [ ] Create `apps/portal/app/vendors/error.tsx` (Error boundary)
- [ ] Create `apps/portal/lib/supabase-client.ts` (Supabase client)

---

**Generated By:** Next.js MCP + Supabase MCP  
**Date:** 2025-12-30


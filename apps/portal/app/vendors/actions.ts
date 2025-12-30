/**
 * Vendor Server Actions
 *
 * Next.js 16 Server Actions for vendor mutations.
 * Uses vendorCRUD for all operations.
 */

'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { vendorCRUD } from '@/src/cruds/vendor-crud';
import type { RequestContext } from '@nexus/cruds';

// Vendor input type for forms (without schema headers)
interface VendorInput {
  legal_name: string;
  display_name?: string;
  country_code: string;
  email?: string;
  phone?: string;
  status?: string;
  official_aliases?: Array<{ type: string; value: string; jurisdiction: string }>;
}

// TODO: Get RequestContext from authentication middleware
// For now, using placeholder context
function getRequestContext(): RequestContext {
  // TODO: Extract from session/auth
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: 'default', // TODO: Get from auth
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export async function createVendorAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const payload: VendorInput = {
      legal_name: formData.get('legal_name') as string,
      display_name: (formData.get('display_name') as string) || undefined,
      country_code: formData.get('country_code') as string,
      email: (formData.get('email') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      status: (formData.get('status') as string) || 'PENDING',
      official_aliases: [], // TODO: Parse from form
    };

    const vendor = await vendorCRUD.create(ctx, {
      ...payload,
      tenant_id: ctx.actor.tenantId || 'default',
    } as any);

    revalidatePath('/vendors');
    redirect(`/vendors/${vendor.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create vendor',
    };
  }
}

export async function updateVendorAction(id: string, formData: FormData) {
  try {
    const ctx = getRequestContext();
    const payload: Partial<VendorInput> = {
      legal_name: formData.get('legal_name') as string,
      display_name: (formData.get('display_name') as string) || undefined,
      country_code: formData.get('country_code') as string,
      email: (formData.get('email') as string) || undefined,
      phone: (formData.get('phone') as string) || undefined,
      status: formData.get('status') as string,
      official_aliases: [], // TODO: Parse from form
    };

    await vendorCRUD.update(ctx, id, payload as any);

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
    const ctx = getRequestContext();
    const vendor = await vendorCRUD.get(ctx, id);
    const updated = { ...vendor, [field]: value };
    await vendorCRUD.update(ctx, id, updated as any);

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
    const ctx = getRequestContext();
    await vendorCRUD.softDelete(ctx, id, 'User deletion');
    revalidatePath('/vendors');
    redirect('/vendors');
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete vendor',
    };
  }
}


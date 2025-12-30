/**
 * Vendor Profile Server Actions
 * 
 * Server Actions for vendor profile updates (contact info, bank details).
 * Bank details require case creation for change requests (security).
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase-client';
import { CaseRepository } from '@/src/repositories/case-repository';
import { AuditTrailRepository } from '@/src/repositories/audit-trail-repository';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      vendorId: 'default', // TODO: Get from vendor_user_access
      tenantId: null,
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export interface UpdateVendorProfileResult {
  success: boolean;
  error?: string;
  requiresCase?: boolean;
  caseId?: string;
}

/**
 * Update vendor contact information (email, phone, address)
 * These fields can be updated directly without case creation.
 */
export async function updateVendorContactAction(
  vendorId: string,
  formData: FormData
): Promise<UpdateVendorProfileResult> {
  try {
    const ctx = getRequestContext();
    const supabase = createClient();

    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const address = formData.get('address') as string | null;

    // Validate email if provided
    if (email && !email.includes('@')) {
      return { success: false, error: 'Invalid email format' };
    }

    // Update vendor
    const updates: Record<string, unknown> = {};
    if (email !== null) updates.email = email;
    if (phone !== null) updates.phone = phone;
    if (address !== null) updates.address = address;

    const { error } = await supabase
      .from('vmp_vendors')
      .update(updates)
      .eq('id', vendorId);

    if (error) {
      return { success: false, error: `Failed to update contact info: ${error.message}` };
    }

    // Create audit trail
    const auditTrail = new AuditTrailRepository();
    await auditTrail.insert({
      entity_type: 'vendor',
      entity_id: vendorId,
      action: 'update_contact',
      action_by: ctx.actor.userId,
      new_state: updates,
      workflow_stage: 'profile_update',
      tenant_id: ctx.actor.tenantId || 'default',
    });

    revalidatePath('/vendor/profile');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update contact information',
    };
  }
}

/**
 * Request bank details change (creates a case for approval)
 * Bank details are critical and require change request case.
 */
export async function requestBankDetailsChangeAction(
  vendorId: string,
  formData: FormData
): Promise<UpdateVendorProfileResult> {
  try {
    const ctx = getRequestContext();
    const supabase = createClient();
    const caseRepo = new CaseRepository();

    // Get vendor to find tenant_id and company_id
    const { data: vendor } = await supabase
      .from('vmp_vendors')
      .select('tenant_id, company_id')
      .eq('id', vendorId)
      .single();

    if (!vendor) {
      return { success: false, error: 'Vendor not found' };
    }

    // Get bank details from form
    const bankName = formData.get('bank_name') as string;
    const accountNumber = formData.get('account_number') as string;
    const swiftCode = formData.get('swift_code') as string | null;
    const bankAddress = formData.get('bank_address') as string | null;
    const accountHolderName = formData.get('account_holder_name') as string | null;

    // Validate required fields
    if (!bankName || !accountNumber) {
      return { success: false, error: 'Bank name and account number are required' };
    }

    // Create change request case
    const caseData = await caseRepo.create(
      {
        tenant_id: vendor.tenant_id,
        company_id: vendor.company_id || 'default', // TODO: Get actual company_id
        vendor_id: vendorId,
        case_type: 'general',
        subject: 'Bank Account Details Change Request',
        owner_team: 'finance',
        tags: ['bank_change_request', 'vendor_request'],
      },
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    // Store requested bank details in case metadata (via message or evidence)
    // For now, we'll store it in a message
    const { data: messageData } = await supabase
      .from('vmp_messages')
      .insert({
        case_id: caseData.id,
        channel_source: 'portal',
        sender_type: 'vendor',
        sender_user_id: ctx.actor.userId,
        body: `Bank Details Change Request:\n\nBank Name: ${bankName}\nAccount Number: ${accountNumber}${swiftCode ? `\nSWIFT Code: ${swiftCode}` : ''}${bankAddress ? `\nBank Address: ${bankAddress}` : ''}${accountHolderName ? `\nAccount Holder: ${accountHolderName}` : ''}`,
        is_internal_note: false,
        metadata: {
          change_type: 'bank_details',
          requested_bank_name: bankName,
          requested_account_number: accountNumber,
          requested_swift_code: swiftCode,
          requested_bank_address: bankAddress,
          requested_account_holder_name: accountHolderName,
        },
      })
      .select()
      .single();

    revalidatePath('/vendor/profile');
    revalidatePath('/vendor/cases');

    return {
      success: true,
      requiresCase: true,
      caseId: caseData.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create bank change request',
    };
  }
}

/**
 * Update display name (can be updated directly)
 */
export async function updateDisplayNameAction(
  vendorId: string,
  displayName: string
): Promise<UpdateVendorProfileResult> {
  try {
    const ctx = getRequestContext();
    const supabase = createClient();

    // Validate display name
    if (!displayName || displayName.length < 2 || displayName.length > 120) {
      return { success: false, error: 'Display name must be between 2 and 120 characters' };
    }

    const { error } = await supabase
      .from('vmp_vendors')
      .update({ display_name: displayName })
      .eq('id', vendorId);

    if (error) {
      return { success: false, error: `Failed to update display name: ${error.message}` };
    }

    // Create audit trail
    const auditTrail = new AuditTrailRepository();
    await auditTrail.insert({
      entity_type: 'vendor',
      entity_id: vendorId,
      action: 'update_display_name',
      action_by: ctx.actor.userId,
      new_state: { display_name: displayName },
      workflow_stage: 'profile_update',
      tenant_id: ctx.actor.tenantId || 'default',
    });

    revalidatePath('/vendor/profile');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update display name',
    };
  }
}


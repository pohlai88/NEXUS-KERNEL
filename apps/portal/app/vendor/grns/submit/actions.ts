/**
 * GRN Submission Server Actions
 */

'use server';

import { revalidatePath } from 'next/cache';
import { GRNRepository } from '@/src/repositories/grn-repository';
import { DocumentRepository } from '@/src/repositories/document-repository';
import { VendorGroupRepository } from '@/src/repositories/vendor-group-repository';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: 'default', // TODO: Get from auth
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export async function submitGRNAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const grnRepo = new GRNRepository();
    const docRepo = new DocumentRepository();
    const vendorGroupRepo = new VendorGroupRepository();

    const poId = formData.get('po_id') as string;
    const grnNumber = formData.get('grn_number') as string;
    const totalAmount = formData.get('total_amount')
      ? parseFloat(formData.get('total_amount') as string)
      : undefined;
    const submittedBy = formData.get('submitted_by') as string;
    const documentFile = formData.get('document') as File | null;

    if (!poId || !grnNumber) {
      return { error: 'PO ID and GRN Number are required' };
    }

    // Get PO details (company_id, vendor_id, po_number)
    const supabase = (await import('@/lib/supabase-client')).createClient();
    const { data: po } = await supabase
      .from('vmp_po_refs')
      .select('company_id, vendor_id, po_number')
      .eq('id', poId)
      .single();

    if (!po) {
      return { error: 'PO not found' };
    }

    // Upload document if provided (using existing uploadDocumentAction pattern)
    let documentId: string | undefined;
    if (documentFile && documentFile.size > 0) {
      // TODO: Use uploadDocumentAction from /documents/actions.ts
      // For now, document upload is handled separately
      // Document ID will be linked after GRN creation
    }

    // Submit GRN
    const grn = await grnRepo.submit(
      {
        po_number: po.po_number,
        grn_number: grnNumber,
        total_amount: totalAmount,
        document_id: documentId,
        submitted_by: submittedBy,
        company_id: po.company_id,
        vendor_id: po.vendor_id,
      },
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/vendor/grns/submit');
    revalidatePath('/vendor-omni-dashboard');
    return { success: true, grn_id: grn.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to submit GRN',
    };
  }
}


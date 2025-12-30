/**
 * PO Acknowledgment Server Actions
 */

'use server';

import { revalidatePath } from 'next/cache';
import { PORepository } from '@/src/repositories/po-repository';
import { DocumentRepository } from '@/src/repositories/document-repository';

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

export async function acknowledgePOAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const poRepo = new PORepository();
    const docRepo = new DocumentRepository();

    const poId = formData.get('po_id') as string;
    const action = formData.get('action') as 'accept' | 'reject';
    const notes = formData.get('notes') as string | null;
    const acknowledgedBy = formData.get('acknowledged_by') as string;
    const documentFile = formData.get('document') as File | null;

    if (!poId || !action) {
      return { error: 'PO ID and action are required' };
    }

    // Upload document if provided (using existing uploadDocumentAction pattern)
    let documentId: string | undefined;
    if (documentFile && documentFile.size > 0) {
      // TODO: Use uploadDocumentAction from /documents/actions.ts
      // For now, document upload is handled separately
      // Document ID will be linked after PO acknowledgment
    }

    // Acknowledge PO
    const po = await poRepo.acknowledge(
      {
        po_id: poId,
        action,
        notes: notes || undefined,
        document_id: documentId,
        acknowledged_by: acknowledgedBy,
      },
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath(`/vendor/purchase-orders/${poId}`);
    revalidatePath('/vendor-omni-dashboard');
    return { success: true, po_id: po.id, status: po.status };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to acknowledge PO',
    };
  }
}


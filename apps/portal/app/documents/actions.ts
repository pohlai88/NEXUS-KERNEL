/**
 * Document Server Actions with Signing Support
 * 
 * Server Actions for document operations including cryptographic signing.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { DocumentRepository } from '@/src/repositories/document-repository';
import { DocumentSignatureRepository } from '@/src/repositories/document-signature-repository';
import { createHash } from 'crypto';

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

/**
 * Generate SHA-256 hash of file content
 */
function generateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = Buffer.from(e.target?.result as ArrayBuffer);
      const hash = createHash('sha256').update(buffer).digest('hex');
      resolve(hash);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function uploadDocumentAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const docRepo = new DocumentRepository();

    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    const documentId = formData.get('document_id') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    if (documentId) {
      // Upload new version
      await docRepo.uploadVersion(documentId, file, {
        tenantId: ctx.actor.tenantId || 'default',
        uploadedBy: ctx.actor.userId,
        category: category || undefined,
        description: description || undefined,
      });
    } else {
      // Create new document first (TODO: implement document creation)
      return { error: 'Document creation not yet implemented' };
    }

    revalidatePath('/documents');
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to upload document',
    };
  }
}

export async function signDocumentAction(
  documentId: string,
  documentVersionId: string | null,
  signerRole: string,
  signerName: string
) {
  try {
    const ctx = getRequestContext();
    const docRepo = new DocumentRepository();
    const signatureRepo = new DocumentSignatureRepository();

    // Get document to calculate content hash
    const document = await docRepo.getById(documentId);
    if (!document) {
      return { error: 'Document not found' };
    }

    // Get document version if provided
    let documentContentHash: string;
    if (documentVersionId) {
      const versions = await docRepo.getVersions(documentId);
      const version = versions.find((v) => v.id === documentVersionId);
      if (!version) {
        return { error: 'Document version not found' };
      }

      // Get file from storage and calculate hash
      // For now, use a placeholder - in production, fetch file and calculate hash
      documentContentHash = version.file_path; // Placeholder - should be actual file hash
    } else {
      // Use current document file
      documentContentHash = document.file_url; // Placeholder - should be actual file hash
    }

    // Sign document
    const signature = await signatureRepo.signDocument({
      document_id: documentId,
      document_version_id: documentVersionId || undefined,
      signer_id: ctx.actor.userId,
      signer_role: signerRole,
      signer_name: signerName,
      document_content_hash: documentContentHash,
      tenant_id: ctx.actor.tenantId || 'default',
      signing_method: 'digital_signature',
    });

    revalidatePath('/documents');
    return { success: true, signature_id: signature.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to sign document',
    };
  }
}

export async function deleteVersionAction(versionId: string) {
  try {
    const docRepo = new DocumentRepository();
    await docRepo.deleteVersion(versionId);
    revalidatePath('/documents');
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete version',
    };
  }
}

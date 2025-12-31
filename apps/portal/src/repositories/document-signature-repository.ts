/**
 * Document Signature Repository
 * 
 * Manages cryptographic document signatures with proof timestamps.
 * Every signature creates an immutable audit record.
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface DocumentSignature {
  id: string;
  document_id: string;
  document_version_id: string | null;
  signer_id: string;
  signer_role: string;
  signer_name: string;
  signature_hash: string;
  document_content_hash: string;
  signed_at: string;
  proof_timestamp: string;
  proof_hash: string;
  signing_method: string;
  signing_device: string | null;
  ip_address: string | null;
  tenant_id: string;
  audit_trail_id: string;
  created_at: string;
}

export interface SignDocumentParams {
  document_id: string;
  document_version_id?: string;
  signer_id: string;
  signer_role: string;
  signer_name: string;
  document_content_hash: string; // SHA-256 hash of document content
  tenant_id: string;
  signing_method?: string;
  signing_device?: string;
  ip_address?: string;
}

export class DocumentSignatureRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Sign a document with cryptographic proof
   */
  async signDocument(params: SignDocumentParams): Promise<DocumentSignature> {
    // Call PostgreSQL function to sign document
    const { data: signatureId, error } = await this.supabase.rpc('sign_document', {
      p_document_id: params.document_id,
      p_document_version_id: params.document_version_id || null,
      p_signer_id: params.signer_id,
      p_signer_role: params.signer_role,
      p_signer_name: params.signer_name,
      p_document_content_hash: params.document_content_hash,
      p_tenant_id: params.tenant_id,
      p_signing_method: params.signing_method || 'digital_signature',
      p_signing_device: params.signing_device || null,
      p_ip_address: params.ip_address || null,
    });

    if (error) {
      throw new Error(`Failed to sign document: ${error.message}`);
    }

    // Fetch the inserted signature
    const { data: signature, error: fetchError } = await this.supabase
      .from('document_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch signature: ${fetchError.message}`);
    }

    return this.mapRowToSignature(signature);
  }

  /**
   * Get all signatures for a document
   */
  async getByDocument(documentId: string): Promise<DocumentSignature[]> {
    const { data, error } = await this.supabase
      .from('document_signatures')
      .select('*')
      .eq('document_id', documentId)
      .order('signed_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get document signatures: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToSignature(row));
  }

  /**
   * Get signature by ID
   */
  async getById(signatureId: string): Promise<DocumentSignature | null> {
    const { data, error } = await this.supabase
      .from('document_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get signature: ${error.message}`);
    }

    return this.mapRowToSignature(data);
  }

  /**
   * Verify signature integrity
   */
  async verifySignature(signatureId: string): Promise<{
    valid: boolean;
    document_content_valid: boolean;
    audit_trail_valid: boolean;
  }> {
    const signature = await this.getById(signatureId);
    if (!signature) {
      throw new Error('Signature not found');
    }

    // Verify signature hash matches expected
    const expectedHash = await this.supabase.rpc('generate_document_signature_hash', {
      document_id: signature.document_id,
      document_version_id: signature.document_version_id || null,
      signer_id: signature.signer_id,
      signed_at: signature.signed_at,
      document_content_hash: signature.document_content_hash,
    });

    const signature_hash_valid = expectedHash.data === signature.signature_hash;

    // Verify audit trail integrity
    const auditIntegrity = await this.auditTrail.verifyIntegrity(
      'document',
      signature.document_id
    );

    return {
      valid: signature_hash_valid && auditIntegrity.valid,
      document_content_valid: signature_hash_valid,
      audit_trail_valid: auditIntegrity.valid,
    };
  }

  /**
   * Map database row to DocumentSignature
   */
  private mapRowToSignature(row: unknown): DocumentSignature {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      document_id: r.document_id as string,
      document_version_id: (r.document_version_id as string) || null,
      signer_id: r.signer_id as string,
      signer_role: r.signer_role as string,
      signer_name: r.signer_name as string,
      signature_hash: r.signature_hash as string,
      document_content_hash: r.document_content_hash as string,
      signed_at: r.signed_at as string,
      proof_timestamp: r.proof_timestamp as string,
      proof_hash: r.proof_hash as string,
      signing_method: r.signing_method as string,
      signing_device: (r.signing_device as string) || null,
      ip_address: (r.ip_address as string) || null,
      tenant_id: r.tenant_id as string,
      audit_trail_id: r.audit_trail_id as string,
      created_at: r.created_at as string,
    };
  }
}


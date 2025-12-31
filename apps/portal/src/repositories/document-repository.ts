/**
 * Document Repository
 *
 * Manages document storage with version tracking.
 * Uses Supabase Storage for file storage.
 * Direct Kernel alignment - NO mapping layer.
 */

import { createServiceClient } from '@/lib/supabase-client';
import type { SoftDeleteRecord } from '@nexus/cruds';

export interface DocumentFilters {
  category?: string;
  search?: string;
  vendor_id?: string;
  organization_id?: string;
  tags?: string[];
}

// Document type with version tracking
export interface Document extends SoftDeleteRecord {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  file_type?: string; // Display-friendly file type (e.g., 'PDF', 'Image')
  category: 'invoice' | 'contract' | 'statement' | 'other';
  file_url: string;
  file_size: number;
  mime_type: string;
  organization_id: string;
  vendor_id?: string;
  is_shared: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at: string | null;
}

// Document Version type
export interface DocumentVersion {
  id: string;
  document_id: string;
  tenant_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  storage_bucket: string;
  version_number: number;
  is_current: boolean;
  uploaded_by: string;
  uploaded_at: string;
  upload_metadata: Record<string, unknown>;
  category?: string;
  description?: string;
  tags: string[];
  deleted_at: string | null;
}

// Database row types
interface DocumentRow {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  category: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  organization_id: string;
  vendor_id: string | null;
  is_shared: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface DocumentVersionRow {
  id: string;
  document_id: string;
  tenant_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  storage_bucket: string;
  version_number: number;
  is_current: boolean;
  uploaded_by: string;
  uploaded_at: string;
  upload_metadata: unknown;
  category: string | null;
  description: string | null;
  tags: string[];
  deleted_at: string | null;
}

export class DocumentRepository {
  private supabase = createServiceClient();

  /**
   * List documents with filters
   */
  async list(filters?: DocumentFilters): Promise<Document[]> {
    let query = this.supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id);
    }

    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id);
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list documents: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToDocument(row));
  }

  /**
   * Get document by ID
   */
  async getById(id: string): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get document: ${error.message}`);
    }

    return this.mapRowToDocument(data);
  }

  /**
   * Get all versions of a document
   */
  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await this.supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .is('deleted_at', null)
      .order('version_number', { ascending: false });

    if (error) {
      throw new Error(`Failed to get document versions: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToVersion(row));
  }

  /**
   * Upload new document version
   */
  async uploadVersion(
    documentId: string,
    file: File,
    metadata: {
      tenantId: string;
      uploadedBy: string;
      category?: string;
      description?: string;
      tags?: string[];
    }
  ): Promise<DocumentVersion> {
    // Generate file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentId}/${Date.now()}.${fileExt}`;
    const bucket = 'documents';

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get current version number
    const versions = await this.getVersions(documentId);
    const nextVersion = versions.length > 0 ? versions[0].version_number + 1 : 1;

    // Mark all previous versions as not current
    if (versions.length > 0) {
      await this.supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', documentId)
        .eq('is_current', true);
    }

    // Create version record
    const versionRow: Omit<DocumentVersionRow, 'id' | 'uploaded_at'> = {
      document_id: documentId,
      tenant_id: metadata.tenantId,
      file_name: file.name,
      file_path: uploadData.path,
      file_size: file.size,
      mime_type: file.type,
      storage_bucket: bucket,
      version_number: nextVersion,
      is_current: true,
      uploaded_by: metadata.uploadedBy,
      upload_metadata: {},
      category: metadata.category || null,
      description: metadata.description || null,
      tags: metadata.tags || [],
      deleted_at: null,
    };

    const { data: versionData, error: versionError } = await this.supabase
      .from('document_versions')
      .insert(versionRow)
      .select()
      .single();

    if (versionError) {
      // Rollback: delete uploaded file
      await this.supabase.storage.from(bucket).remove([uploadData.path]);
      throw new Error(`Failed to create version record: ${versionError.message}`);
    }

    // Update document record
    await this.supabase
      .from('documents')
      .update({
        file_url: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        version: nextVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId);

    return this.mapRowToVersion(versionData);
  }

  /**
   * Get signed URL for document preview
   */
  async getPreviewUrl(filePath: string, bucket: string = 'documents'): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Delete document version
   */
  async deleteVersion(versionId: string): Promise<void> {
    // Get version to get file path
    const { data: version, error: getError } = await this.supabase
      .from('document_versions')
      .select('file_path, storage_bucket, document_id, is_current')
      .eq('id', versionId)
      .single();

    if (getError) {
      throw new Error(`Failed to get version: ${getError.message}`);
    }

    // Soft delete version
    const { error: deleteError } = await this.supabase
      .from('document_versions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', versionId);

    if (deleteError) {
      throw new Error(`Failed to delete version: ${deleteError.message}`);
    }

    // If this was the current version, mark the latest remaining version as current
    if (version.is_current) {
      const remainingVersions = await this.getVersions(version.document_id);
      if (remainingVersions.length > 0) {
        await this.supabase
          .from('document_versions')
          .update({ is_current: true })
          .eq('id', remainingVersions[0].id);
      }
    }

    // Optionally delete file from storage (hard delete)
    // await this.supabase.storage.from(version.storage_bucket).remove([version.file_path]);
  }

  /**
   * Map database row to Document
   */
  private mapRowToDocument(row: DocumentRow): Document {
    return {
      id: row.id,
      tenant_id: row.tenant_id,
      name: row.name,
      type: row.type,
      category: row.category as Document['category'],
      file_url: row.file_url,
      file_size: row.file_size,
      mime_type: row.mime_type,
      organization_id: row.organization_id,
      vendor_id: row.vendor_id || undefined,
      is_shared: row.is_shared,
      version: row.version,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by,
      deleted_at: null, // documents table doesn't have deleted_at yet
      deletedAt: null,
      deletedBy: null,
    };
  }

  /**
   * Map database row to DocumentVersion
   */
  private mapRowToVersion(row: DocumentVersionRow): DocumentVersion {
    return {
      id: row.id,
      document_id: row.document_id,
      tenant_id: row.tenant_id,
      file_name: row.file_name,
      file_path: row.file_path,
      file_size: row.file_size,
      mime_type: row.mime_type,
      storage_bucket: row.storage_bucket,
      version_number: row.version_number,
      is_current: row.is_current,
      uploaded_by: row.uploaded_by,
      uploaded_at: row.uploaded_at,
      upload_metadata: (row.upload_metadata as Record<string, unknown>) || {},
      category: row.category || undefined,
      description: row.description || undefined,
      tags: row.tags || [],
      deleted_at: row.deleted_at,
    };
  }
}


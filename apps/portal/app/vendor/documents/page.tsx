/**
 * Vendor Document Library Page
 * 
 * View all documents (Compliance, Certificates, Contracts), Upload new documents,
 * Document categories, Version history, Expiry tracking.
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { DocumentRepository } from '@/src/repositories/document-repository';
import { VendorGroupRepository } from '@/src/repositories/vendor-group-repository';
import Link from 'next/link';
import { DocumentUpload } from '@/components/documents/DocumentUpload';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      vendorGroupId: 'default', // TODO: Get from vendor_user_access
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

interface VendorDocumentsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    document_id?: string;
  };
}

export default async function VendorDocumentsPage({ searchParams }: VendorDocumentsPageProps) {
  const ctx = getRequestContext();
  const docRepo = new DocumentRepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries = await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Get vendor ID (in production, from vendor_user_access -> vendor_group -> vmp_vendors)
  const supabase = createClient();
  const { data: vendorAccess } = await supabase
    .from('vendor_user_access')
    .select('vendor_group_id')
    .eq('user_id', ctx.actor.userId)
    .limit(1)
    .single();

  // Get vendor documents
  const documents = await docRepo.list({
    category: searchParams.category,
    search: searchParams.search,
    // vendor_id would be from vendor_user_access -> vendor_group -> vmp_vendors
    // For now, filter by accessible tenants
    organization_id: accessibleTenantIds[0] || undefined,
  });

  // Get selected document with versions
  let selectedDocument = null;
  let documentVersions: unknown[] = [];
  if (searchParams.document_id) {
    selectedDocument = await docRepo.getById(searchParams.document_id);
    if (selectedDocument) {
      documentVersions = await docRepo.getVersions(searchParams.document_id);
    }
  }

  // Group documents by category
  const documentsByCategory = documents.reduce(
    (acc, doc) => {
      const category = doc.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    },
    {} as Record<string, typeof documents>
  );

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Document Library</h1>
        <Link href="/vendor/dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Upload Section */}
      <div className="card p-6 mb-6">
        <h2 className="section mb-4">Upload New Document</h2>
        <DocumentUpload
          onUploadComplete={() => {
            // Handle upload completion
          }}
        />
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <form method="get" className="flex gap-4 items-end">
          <div>
            <label className="caption mb-2 block">Category</label>
            <select name="category" className="input" defaultValue={searchParams.category || ''}>
              <option value="">All Categories</option>
              <option value="compliance">Compliance</option>
              <option value="certificate">Certificate</option>
              <option value="contract">Contract</option>
              <option value="invoice">Invoice</option>
              <option value="po">Purchase Order</option>
              <option value="grn">GRN</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="caption mb-2 block">Search</label>
            <input
              type="text"
              name="search"
              className="input w-full"
              placeholder="Search documents..."
              defaultValue={searchParams.search || ''}
            />
          </div>
          <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
            Filter
          </button>
          <Link href="/vendor/documents" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
            Clear
          </Link>
        </form>
      </div>

      {/* Documents Grid + Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="lg:col-span-2">
          {Object.keys(documentsByCategory).length === 0 ? (
            <div className="card p-6 text-center">
              <h2 className="text-base font-semibold text-nx-text-main">No Documents Found</h2>
              <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-2">Upload your first document to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(documentsByCategory).map(([category, docs]) => (
                <div key={category} className="card p-6">
                  <h3 className="text-base font-semibold text-nx-text-main mb-4">{category.toUpperCase()}</h3>
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/vendor/documents?document_id=${doc.id}`}
                        className="card p-4 flex items-center justify-between hover:bg-nx-surface-well"
                      >
                        <div>
                          <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{doc.name}</div>
                          <div className="caption text-sm">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="caption text-sm">{doc.file_type}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Preview */}
        <div className="lg:col-span-1">
          {selectedDocument ? (
            <div className="card p-6">
              <h3 className="text-base font-semibold text-nx-text-main mb-4">Document Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="caption mb-2 block">Name</label>
                  <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{selectedDocument.name}</div>
                </div>
                <div>
                  <label className="caption mb-2 block">Category</label>
                  <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{selectedDocument.category}</div>
                </div>
                <div>
                  <label className="caption mb-2 block">Created</label>
                  <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
                    {new Date(selectedDocument.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="caption mb-2 block">File Type</label>
                  <div className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{selectedDocument.file_type}</div>
                </div>
                <a
                  href={selectedDocument.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full"
                >
                  View Document
                </a>
              </div>

              {/* Version History */}
              {documentVersions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-nx-text-main mb-4">Version History</h4>
                  <div className="space-y-2">
                    {documentVersions.map((version: unknown) => {
                      const v = version as { id: string; version_number: number; created_at: string };
                      return (
                        <div key={v.id} className="card p-3">
                          <div className="caption text-sm">
                            Version {v.version_number} - {new Date(v.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">Select a document to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

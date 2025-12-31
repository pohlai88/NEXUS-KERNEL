/**
 * Vendor Document Library Page
 *
 * View all documents (Compliance, Certificates, Contracts), Upload new documents,
 * Document categories, Version history, Expiry tracking.
 */

import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { getRequestContext } from "@/lib/dev-auth-context";
import { createClient } from "@/lib/supabase-client";
import { DocumentRepository } from "@/src/repositories/document-repository";
import { VendorGroupRepository } from "@/src/repositories/vendor-group-repository";
import Link from "next/link";

interface VendorDocumentsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    document_id?: string;
  }>;
}

export default async function VendorDocumentsPage({
  searchParams,
}: VendorDocumentsPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const docRepo = new DocumentRepository();
  const vendorGroupRepo = new VendorGroupRepository();

  // Get accessible subsidiaries
  const accessibleSubsidiaries =
    await vendorGroupRepo.getAccessibleSubsidiaries(ctx.actor.userId);
  const accessibleTenantIds = accessibleSubsidiaries.map((s) => s.tenant_id);

  // Get vendor ID (in production, from vendor_user_access -> vendor_group -> vmp_vendors)
  const supabase = createClient();
  const { data: vendorAccess } = await supabase
    .from("vendor_user_access")
    .select("vendor_group_id")
    .eq("user_id", ctx.actor.userId)
    .limit(1)
    .single();

  // Get vendor documents
  const documents = await docRepo.list({
    category: params.category,
    search: params.search,
    // vendor_id would be from vendor_user_access -> vendor_group -> vmp_vendors
    // For now, filter by accessible tenants
    organization_id: accessibleTenantIds[0] || undefined,
  });

  // Get selected document with versions
  let selectedDocument = null;
  let documentVersions: unknown[] = [];
  if (params.document_id) {
    selectedDocument = await docRepo.getById(params.document_id);
    if (selectedDocument) {
      documentVersions = await docRepo.getVersions(params.document_id);
    }
  }

  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    const category = doc.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>);

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Document Library</h1>
        <Link href="/vendor/dashboard" className="na-btn na-btn-ghost">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Upload Section */}
      <div className="na-card na-p-6 na-mb-6">
        <h2 className="na-h3 na-mb-4">Upload New Document</h2>
        <DocumentUpload />
      </div>

      {/* Filters */}
      <div className="na-card na-p-4 na-mb-6">
        <form method="get" className="na-flex na-gap-4 na-items-end">
          <div>
            <label className="na-metadata na-mb-2 na-block">Category</label>
            <select
              name="category"
              className="na-input"
              defaultValue={params.category || ""}
            >
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
          <div className="na-flex-1">
            <label className="na-metadata na-mb-2 na-block">Search</label>
            <input
              type="text"
              name="search"
              className="na-input na-w-full"
              placeholder="Search documents..."
              defaultValue={params.search || ""}
            />
          </div>
          <button type="submit" className="na-btn na-btn-secondary">
            Filter
          </button>
          <Link href="/vendor/documents" className="na-btn na-btn-ghost">
            Clear
          </Link>
        </form>
      </div>

      {/* Documents Grid + Preview Layout */}
      <div className="na-grid na-grid-cols-1 lg:na-grid-cols-3 na-gap-6">
        {/* Documents List */}
        <div className="lg:na-col-span-2">
          {Object.keys(documentsByCategory).length === 0 ? (
            <div className="na-card na-p-6 na-text-center">
              <h2 className="na-h4">No Documents Found</h2>
              <p className="na-body na-mt-2">
                Upload your first document to get started.
              </p>
            </div>
          ) : (
            <div className="na-space-y-6">
              {Object.entries(documentsByCategory).map(([category, docs]) => (
                <div key={category} className="na-card na-p-6">
                  <h3 className="na-h4 na-mb-4">{category.toUpperCase()}</h3>
                  <div className="na-space-y-2">
                    {docs.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/vendor/documents?document_id=${doc.id}`}
                        className="na-card na-p-4 na-flex na-items-center na-justify-between na-hover-bg-paper-2"
                      >
                        <div>
                          <div className="na-body">{doc.name}</div>
                          <div className="na-metadata na-text-sm">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="na-metadata na-text-sm">
                          {doc.file_type}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Preview */}
        <div className="lg:na-col-span-1">
          {selectedDocument ? (
            <div className="na-card na-p-6">
              <h3 className="na-h4 na-mb-4">Document Details</h3>
              <div className="na-space-y-4">
                <div>
                  <label className="na-metadata na-mb-2 na-block">Name</label>
                  <div className="na-body">{selectedDocument.name}</div>
                </div>
                <div>
                  <label className="na-metadata na-mb-2 na-block">
                    Category
                  </label>
                  <div className="na-body">{selectedDocument.category}</div>
                </div>
                <div>
                  <label className="na-metadata na-mb-2 na-block">
                    Created
                  </label>
                  <div className="na-body">
                    {new Date(selectedDocument.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="na-metadata na-mb-2 na-block">
                    File Type
                  </label>
                  <div className="na-body">{selectedDocument.file_type}</div>
                </div>
                <a
                  href={selectedDocument.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="na-btn na-btn-primary na-w-full"
                >
                  View Document
                </a>
              </div>

              {/* Version History */}
              {documentVersions.length > 0 && (
                <div className="na-mt-6">
                  <h4 className="na-h5 na-mb-4">Version History</h4>
                  <div className="na-space-y-2">
                    {documentVersions.map((version: unknown) => {
                      const v = version as {
                        id: string;
                        version_number: number;
                        created_at: string;
                      };
                      return (
                        <div key={v.id} className="na-card na-p-3">
                          <div className="na-metadata na-text-sm">
                            Version {v.version_number} -{" "}
                            {new Date(v.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="na-card na-p-6 na-text-center">
              <p className="na-body">Select a document to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

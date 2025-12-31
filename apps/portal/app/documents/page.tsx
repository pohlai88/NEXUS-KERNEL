/**
 * Document Storage Management Page
 *
 * Grid view (left) + Preview (right)
 * Version tracking, who uploaded, when
 */

import { DocumentGrid } from "@/components/documents/DocumentGrid";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { getRequestContext } from "@/lib/dev-auth-context";
import {
  DocumentRepository,
  type DocumentVersion,
} from "@/src/repositories/document-repository";
import { Suspense } from "react";

interface DocumentsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    vendor_id?: string;
    document_id?: string;
  }>;
}

export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const ctx = getRequestContext();
  const params = await searchParams;
  const docRepo = new DocumentRepository();

  // Fetch documents
  const documents = await docRepo.list({
    category: params.category,
    search: params.search,
    vendor_id: params.vendor_id,
    organization_id: ctx.actor.tenantId,
  });

  // Fetch selected document with versions
  let selectedDocument = null;
  let documentVersions: DocumentVersion[] = [];
  if (params.document_id) {
    selectedDocument = await docRepo.getById(params.document_id);
    if (selectedDocument) {
      documentVersions = await docRepo.getVersions(params.document_id);
    }
  }

  return (
    <div className="na-shell-main na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Document Storage</h1>
        <button className="na-btn na-btn-primary" type="button">
          Upload Document
        </button>
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
              <option value="">All</option>
              <option value="invoice">Invoice</option>
              <option value="contract">Contract</option>
              <option value="statement">Statement</option>
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
        </form>
      </div>

      {/* Grid + Preview Layout */}
      <div className="na-grid na-grid-cols-1 lg:na-grid-cols-3 na-gap-6">
        {/* Left: Document Grid */}
        <div className="lg:na-col-span-1">
          <DocumentGrid
            documents={documents}
            selectedDocumentId={params.document_id}
          />
        </div>

        {/* Right: Document Preview */}
        <div className="lg:na-col-span-2">
          <Suspense
            fallback={
              <div className="na-card na-p-6">
                <div className="na-spinner" />
                <p className="na-metadata na-mt-2">Loading preview...</p>
              </div>
            }
          >
            {selectedDocument ? (
              <DocumentPreview
                document={selectedDocument}
                versions={documentVersions}
              />
            ) : (
              <div className="na-card na-p-6">
                <h2 className="na-h4">No Document Selected</h2>
                <p className="na-data na-mt-2">
                  Select a document from the grid to view details and preview.
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

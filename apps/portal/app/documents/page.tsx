/**
 * Document Storage Management Page
 * 
 * Grid view (left) + Preview (right)
 * Version tracking, who uploaded, when
 */

import { DocumentRepository } from '@/src/repositories/document-repository';
import { DocumentGrid } from '@/components/documents/DocumentGrid';
import { DocumentPreview } from '@/components/documents/DocumentPreview';

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

interface DocumentsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    vendor_id?: string;
    document_id?: string;
  };
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const ctx = getRequestContext();
  const docRepo = new DocumentRepository();

  // Fetch documents
  const documents = await docRepo.list({
    category: searchParams.category,
    search: searchParams.search,
    vendor_id: searchParams.vendor_id,
    organization_id: ctx.actor.tenantId,
  });

  // Fetch selected document with versions
  let selectedDocument = null;
  let documentVersions = [];
  if (searchParams.document_id) {
    selectedDocument = await docRepo.getById(searchParams.document_id);
    if (selectedDocument) {
      documentVersions = await docRepo.getVersions(searchParams.document_id);
    }
  }

  return (
    <div className="shell p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Document Storage</h1>
        <button className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary" type="button">
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <form method="get" className="flex gap-4 items-end">
          <div>
            <label className="caption mb-2 block">Category</label>
            <select name="category" className="input" defaultValue={searchParams.category || ''}>
              <option value="">All</option>
              <option value="invoice">Invoice</option>
              <option value="contract">Contract</option>
              <option value="statement">Statement</option>
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
        </form>
      </div>

      {/* Grid + Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Grid */}
        <div className="lg:col-span-1">
          <DocumentGrid
            documents={documents}
            selectedDocumentId={searchParams.document_id}
          />
        </div>

        {/* Right: Document Preview */}
        <div className="lg:col-span-2">
          <Suspense fallback={
            <div className="card p-6">
              <div className="animate-spin h-5 w-5 border-2 border-nx-primary border-t-transparent rounded-full" />
              <p className="caption mt-2">Loading preview...</p>
            </div>
          }>
            {selectedDocument ? (
              <DocumentPreview
                document={selectedDocument}
                versions={documentVersions}
              />
            ) : (
              <div className="card p-6">
                <h2 className="text-base font-semibold text-nx-text-main">No Document Selected</h2>
                <p className="text-[length:var(--nx-body-size)] text-nx-text-main mt-2">
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


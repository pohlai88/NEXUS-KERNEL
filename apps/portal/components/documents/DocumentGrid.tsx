/**
 * Document Grid Component
 * 
 * Grid view of documents on the left side.
 * Shows document name, category, version, uploader, date.
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Document } from '@/src/repositories/document-repository';

interface DocumentGridProps {
  documents: Document[];
  selectedDocumentId?: string;
}

export function DocumentGrid({ documents, selectedDocumentId }: DocumentGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (documentId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('document_id', documentId);
    router.push(`/documents?${params.toString()}`);
  };

  const getCategoryClass = (category: string) => {
    const map: Record<string, string> = {
      invoice: 'na-status ok',
      contract: 'na-status warn',
      statement: 'na-status pending',
      other: 'na-metadata',
    };
    return map[category] || 'na-metadata';
  };

  if (documents.length === 0) {
    return (
      <div className="na-card na-p-6">
        <h2 className="na-h4">No Documents</h2>
        <p className="na-data na-mt-2">
          No documents have been uploaded yet. Upload your first document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="na-card na-p-4">
      <h2 className="na-h4 na-mb-4">Documents ({documents.length})</h2>
      <div className="na-grid na-grid-cols-1 na-gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleSelect(doc.id)}
            className={`na-card na-p-4 na-cursor-pointer na-transition-colors ${
              selectedDocumentId === doc.id
                ? 'na-bg-paper-2 na-border-2'
                : 'na-hover-bg-paper-2'
            }`}
          >
            <div className="na-flex na-items-start na-justify-between na-mb-2">
              <h3 className="na-h4 na-truncate">{doc.name}</h3>
              <span className={getCategoryClass(doc.category)}>{doc.category}</span>
            </div>
            <div className="na-flex na-items-center na-gap-4 na-mt-2">
              <span className="na-metadata">v{doc.version}</span>
              <span className="na-metadata">
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="na-metadata na-mt-2">
              {formatFileSize(doc.file_size)} • {doc.mime_type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}


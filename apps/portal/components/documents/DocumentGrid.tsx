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
      invoice: 'badge badge-success',
      contract: 'badge badge-warning',
      statement: 'badge pending',
      other: 'caption',
    };
    return map[category] || 'caption';
  };

  if (documents.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-base font-semibold text-nx-text-main">No Documents</h2>
        <p className="text-[length:var(--nx-body-size)] text-nx-text-main mt-2">
          No documents have been uploaded yet. Upload your first document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h2 className="text-base font-semibold text-nx-text-main mb-4">Documents ({documents.length})</h2>
      <div className="grid grid-cols-1 gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleSelect(doc.id)}
            className={`card p-4 cursor-pointer transition-colors ${
              selectedDocumentId === doc.id
                ? 'bg-nx-surface-well border-2'
                : 'hover:bg-nx-surface-well'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-base font-semibold text-nx-text-main truncate">{doc.name}</h3>
              <span className={getCategoryClass(doc.category)}>{doc.category}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="caption">v{doc.version}</span>
              <span className="caption">
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="caption mt-2">
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


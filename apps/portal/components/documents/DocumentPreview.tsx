/**
 * Document Preview Component
 * 
 * Preview panel on the right side.
 * Shows document details, versions, and preview.
 */

'use client';

import { useState, useEffect } from 'react';
import { DocumentRepository } from '@/src/repositories/document-repository';
import type { Document, DocumentVersion } from '@/src/repositories/document-repository';

interface DocumentPreviewProps {
  document: Document;
  versions: DocumentVersion[];
}

export function DocumentPreview({ document, versions }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(
    versions.find((v) => v.is_current) || versions[0] || null
  );
  const docRepo = new DocumentRepository();


  const loadPreview = async (version: DocumentVersion) => {
    try {
      const url = await docRepo.getPreviewUrl(version.file_path, version.storage_bucket);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Failed to load preview:', error);
      setPreviewUrl(null);
    }
  };

  // Load preview on mount
  useEffect(() => {
    if (selectedVersion) {
      loadPreview(selectedVersion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVersion?.id]);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  return (
    <div className="card p-6">
      {/* Document Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main">{document.name}</h2>
            <p className="caption mt-1">
              {getFileIcon(document.mime_type)} {document.mime_type}
            </p>
          </div>
          <span className="badge badge-success">v{document.version}</span>
        </div>

        {/* Document Metadata */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <span className="caption">Category:</span>
            <span className="text-[length:var(--nx-body-size)] text-nx-text-main ml-2">{document.category}</span>
          </div>
          <div>
            <span className="caption">Size:</span>
            <span className="text-[length:var(--nx-body-size)] text-nx-text-main ml-2">{formatFileSize(document.file_size)}</span>
          </div>
          <div>
            <span className="caption">Created:</span>
            <span className="text-[length:var(--nx-body-size)] text-nx-text-main ml-2">
              {new Date(document.created_at).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="caption">Updated:</span>
            <span className="text-[length:var(--nx-body-size)] text-nx-text-main ml-2">
              {new Date(document.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-nx-text-main mb-4">Version History</h3>
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              onClick={() => setSelectedVersion(version)}
              className={`card p-3 cursor-pointer transition-colors ${
                selectedVersion?.id === version.id
                  ? 'bg-nx-surface-well border-2'
                  : 'hover:bg-nx-surface-well'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[length:var(--nx-body-size)] text-nx-text-main">v{version.version_number}</span>
                  {version.is_current && (
                    <span className="badge badge-success ml-2">Current</span>
                  )}
                </div>
                <div className="caption">
                  {new Date(version.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <div className="caption mt-1">
                Uploaded by: {version.uploaded_by} • {formatFileSize(version.file_size)}
              </div>
              {version.description && (
                <div className="text-[length:var(--nx-body-size)] text-nx-text-main mt-1 text-sm">{version.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document Preview */}
      <div>
        <h3 className="text-base font-semibold text-nx-text-main mb-4">Preview</h3>
        {previewUrl ? (
          <div className="card p-4">
            {document.mime_type.startsWith('image/') ? (
              <img
                src={previewUrl}
                alt={document.name}
                className="w-full rounded"
                style={{ maxHeight: '600px', objectFit: 'contain' }}
              />
            ) : document.mime_type === 'application/pdf' ? (
              <iframe
                src={previewUrl}
                className="w-full"
                style={{ height: '600px', border: 'none' }}
                title={document.name}
              />
            ) : (
              <div className="card p-6 text-center">
                <div className="text-4xl mb-4">{getFileIcon(document.mime_type)}</div>
                <p className="text-[length:var(--nx-body-size)] text-nx-text-main">{document.name}</p>
                <p className="caption mt-2">
                  Preview not available for this file type
                </p>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary mt-4"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="card p-6 text-center">
            <div className="animate-spin h-5 w-5 border-2 border-nx-primary border-t-transparent rounded-full" />
            <p className="caption mt-2">Loading preview...</p>
          </div>
        )}
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


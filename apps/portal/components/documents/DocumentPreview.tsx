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
    <div className="na-card na-p-6">
      {/* Document Header */}
      <div className="na-mb-6">
        <div className="na-flex na-items-start na-justify-between na-mb-4">
          <div>
            <h2 className="na-h2">{document.name}</h2>
            <p className="na-metadata na-mt-1">
              {getFileIcon(document.mime_type)} {document.mime_type}
            </p>
          </div>
          <span className="na-status na-status-ok">v{document.version}</span>
        </div>

        {/* Document Metadata */}
        <div className="na-grid na-grid-cols-2 na-gap-4 na-mt-4">
          <div>
            <span className="na-metadata">Category:</span>
            <span className="na-data na-ml-2">{document.category}</span>
          </div>
          <div>
            <span className="na-metadata">Size:</span>
            <span className="na-data na-ml-2">{formatFileSize(document.file_size)}</span>
          </div>
          <div>
            <span className="na-metadata">Created:</span>
            <span className="na-data na-ml-2">
              {new Date(document.created_at).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="na-metadata">Updated:</span>
            <span className="na-data na-ml-2">
              {new Date(document.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="na-mb-6">
        <h3 className="na-h4 na-mb-4">Version History</h3>
        <div className="na-space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              onClick={() => setSelectedVersion(version)}
              className={`na-card na-p-3 na-cursor-pointer na-transition-colors ${
                selectedVersion?.id === version.id
                  ? 'na-bg-paper-2 na-border-2'
                  : 'na-hover-bg-paper-2'
              }`}
            >
              <div className="na-flex na-items-center na-justify-between">
                <div>
                  <span className="na-data">v{version.version_number}</span>
                  {version.is_current && (
                    <span className="na-status na-status-ok na-ml-2">Current</span>
                  )}
                </div>
                <div className="na-metadata">
                  {new Date(version.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <div className="na-metadata na-mt-1">
                Uploaded by: {version.uploaded_by} • {formatFileSize(version.file_size)}
              </div>
              {version.description && (
                <div className="na-data na-mt-1 na-text-sm">{version.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document Preview */}
      <div>
        <h3 className="na-h4 na-mb-4">Preview</h3>
        {previewUrl ? (
          <div className="na-card na-p-4">
            {document.mime_type.startsWith('image/') ? (
              <img
                src={previewUrl}
                alt={document.name}
                className="na-w-full na-rounded"
                style={{ maxHeight: '600px', objectFit: 'contain' }}
              />
            ) : document.mime_type === 'application/pdf' ? (
              <iframe
                src={previewUrl}
                className="na-w-full"
                style={{ height: '600px', border: 'none' }}
                title={document.name}
              />
            ) : (
              <div className="na-card na-p-6 na-text-center">
                <div className="na-text-4xl na-mb-4">{getFileIcon(document.mime_type)}</div>
                <p className="na-data">{document.name}</p>
                <p className="na-metadata na-mt-2">
                  Preview not available for this file type
                </p>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="na-btn na-btn-primary na-mt-4"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="na-card na-p-6 na-text-center">
            <div className="na-spinner" />
            <p className="na-metadata na-mt-2">Loading preview...</p>
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


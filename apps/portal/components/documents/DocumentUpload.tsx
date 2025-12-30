/**
 * Document Upload Component
 * 
 * Upload new document or new version.
 * Drag & drop support.
 */

'use client';

import { useState, useTransition } from 'react';
import { uploadDocumentAction } from '@/app/documents/actions';
import { useRouter } from 'next/navigation';

interface DocumentUploadProps {
  documentId?: string; // If provided, uploads new version
  onUploadComplete?: () => void;
}

export function DocumentUpload({ documentId, onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file size (max 50MB for free tier)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError(`File size exceeds limit (${formatFileSize(maxSize)})`);
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        const formData = new FormData();
        formData.append('file', file);
        if (documentId) {
          formData.append('document_id', documentId);
        }
        formData.append('category', 'other'); // TODO: Get from form

        const result = await uploadDocumentAction(formData);
        if (result.error) {
          setError(result.error);
        } else {
          onUploadComplete?.();
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div
      className={`na-card na-p-6 na-border-2 na-border-dashed ${
        isDragging ? 'na-bg-paper-2' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="na-text-center">
        <div className="na-text-4xl na-mb-4">📤</div>
        <h3 className="na-h4 na-mb-2">
          {documentId ? 'Upload New Version' : 'Upload Document'}
        </h3>
        <p className="na-metadata na-mb-4">
          Drag and drop a file here, or click to browse
        </p>
        <input
          type="file"
          id="file-upload"
          className="na-hidden"
          onChange={handleFileInput}
          disabled={isPending}
        />
        <label
          htmlFor="file-upload"
          className="na-btn na-btn-primary na-cursor-pointer"
        >
          {isPending ? 'Uploading...' : 'Choose File'}
        </label>
        {error && (
          <div className="na-text-danger na-mt-4 na-text-sm">{error}</div>
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


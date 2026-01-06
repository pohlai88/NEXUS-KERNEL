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
      className={`card p-6 border-2 border-dashed ${
        isDragging ? 'bg-nx-surface-well' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <div className="text-4xl mb-4">📤</div>
        <h3 className="text-base font-semibold text-nx-text-main mb-2">
          {documentId ? 'Upload New Version' : 'Upload Document'}
        </h3>
        <p className="caption mb-4">
          Drag and drop a file here, or click to browse
        </p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileInput}
          disabled={isPending}
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary cursor-pointer"
        >
          {isPending ? 'Uploading...' : 'Choose File'}
        </label>
        {error && (
          <div className="text-nx-danger mt-4 text-sm">{error}</div>
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


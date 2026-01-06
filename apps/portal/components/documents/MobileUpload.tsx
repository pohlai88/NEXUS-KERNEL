/**
 * Mobile Snap & Submit Component
 * 
 * Instagram-style mobile upload for vendors on the road.
 * "No Evidence, No Coin" - Easy upload = immediate submission.
 */

'use client';

import { useState, useRef } from 'react';
import { uploadDocumentAction } from '@/app/documents/actions';

interface MobileUploadProps {
  caseId?: string;
  documentType?: string;
  onUploadComplete?: () => void;
}

export function MobileUpload({ caseId, documentType, onUploadComplete }: MobileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (caseId) {
        formData.append('document_id', caseId);
      }
      formData.append('category', documentType || 'other');

      const result = await uploadDocumentAction(formData);
      if (result.error) {
        alert(result.error);
      } else {
        setSelectedFile(null);
        setPreview(null);
        onUploadComplete?.();
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-base font-semibold text-nx-text-main mb-4">Snap & Submit</h3>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,application/pdf"
        className="hidden"
        capture="environment" // Use camera on mobile
      />

      {!selectedFile ? (
        <div
          className="card p-8 border-2 border-dashed text-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-6xl mb-4">📷</div>
          <p className="text-[length:var(--nx-body-size)] text-nx-text-main mb-2">Tap to take photo or select file</p>
          <p className="caption">Delivery Order, Invoice, Receipt, etc.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {preview && (
            <div className="card p-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
          )}

          <div className="card p-4">
            <p className="caption">File: {selectedFile.name}</p>
            <p className="caption">Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>

          <div className="flex gap-4">
            <button
              className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary flex-1"
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
              }}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary flex-1"
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


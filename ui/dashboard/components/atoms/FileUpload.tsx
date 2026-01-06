/**
 * FileUpload Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Drag & drop file upload with progress tracking
 */

'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { IconUpload, IconClose, IconAttachment } from './icons';
import { Spinner } from './Spinner';

export interface FileUploadProps {
  /** Accept file types (e.g., "image/*", ".pdf,.doc") */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Upload handler (async) */
  onUpload?: (files: File[]) => Promise<void>;
  /** Change handler (fires immediately when files selected) */
  onChange?: (files: File[]) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
}

interface FileWithProgress {
  file: File;
  progress: number;
  error?: string;
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  onUpload,
  onChange,
  disabled = false,
  error,
  label,
  helperText,
  fullWidth = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatBytes(maxSize)}`;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExt = `.${file.name.split('.').pop()}`;

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExt === type;
        }
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', ''));
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted: ${accept}`;
      }
    }

    return null;
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return;

    const newFiles = Array.from(fileList);

    // Check max files limit
    if (maxFiles && files.length + newFiles.length > maxFiles) {
      return;
    }

    const validatedFiles: FileWithProgress[] = newFiles.map(file => ({
      file,
      progress: 0,
      error: validateFile(file) || undefined,
    }));

    const updatedFiles = [...files, ...validatedFiles];
    setFiles(updatedFiles);

    // Call onChange
    const validFiles = updatedFiles.filter(f => !f.error).map(f => f.file);
    onChange?.(validFiles);

    // Auto-upload if handler provided
    if (onUpload && validFiles.length > 0) {
      handleUpload(validFiles);
    }
  };

  const handleUpload = async (filesToUpload: File[]) => {
    if (!onUpload) return;

    setIsUploading(true);

    try {
      await onUpload(filesToUpload);

      // Mark as complete
      setFiles(prev =>
        prev.map(f =>
          filesToUpload.includes(f.file) ? { ...f, progress: 100 } : f
        )
      );
    } catch (err) {
      // Mark with error
      setFiles(prev =>
        prev.map(f =>
          filesToUpload.includes(f.file)
            ? { ...f, error: 'Upload failed' }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange?.(updatedFiles.filter(f => !f.error).map(f => f.file));
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Container styles
  const containerStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-family-sans)',
  };

  // Drop zone styles
  const dropZoneStyles: React.CSSProperties = {
    border: `2px dashed ${error ? 'var(--color-error)' : isDragging ? 'var(--color-primary)' : 'var(--color-gray-300)'}`,
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-8)',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isDragging
      ? 'rgba(99, 102, 241, 0.05)'
      : disabled
        ? 'var(--color-gray-50)'
        : '#FFFFFF',
    opacity: disabled ? 0.5 : 1,
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-caption-size)',
    fontWeight: 600,
    color: error ? 'var(--color-error)' : 'var(--color-gray-700)',
    marginBottom: 'var(--space-2)',
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: 'var(--text-micro-size)',
    color: error ? 'var(--color-error)' : 'var(--color-gray-600)',
    marginTop: 'var(--space-2)',
  };

  const fileListStyles: React.CSSProperties = {
    marginTop: 'var(--space-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  };

  const fileItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3)',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: '#FFFFFF',
  };

  return (
    <div style={containerStyles}>
      {label && <div style={labelStyles}>{label}</div>}

      <div
        style={dropZoneStyles}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />

        <IconUpload size={48} color={isDragging ? 'var(--color-primary)' : 'var(--color-gray-400)'} />

        <div style={{ marginTop: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-body-size)', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 'var(--space-1)' }}>
            {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          <p style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-gray-600)' }}>
            {accept || 'Any file type'} {maxSize && `• Max ${formatBytes(maxSize)}`}
          </p>
        </div>
      </div>

      {(helperText || error) && (
        <div style={helperTextStyles}>
          {error || helperText}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div style={fileListStyles}>
          {files.map((fileWithProgress, index) => (
            <div key={index} style={fileItemStyles}>
              <IconAttachment size={20} color="var(--color-gray-500)" />

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-caption-size)', fontWeight: 500, color: 'var(--color-gray-900)' }}>
                  {fileWithProgress.file.name}
                </div>
                <div style={{ fontSize: 'var(--text-micro-size)', color: 'var(--color-gray-600)' }}>
                  {formatBytes(fileWithProgress.file.size)}
                  {fileWithProgress.error && (
                    <span style={{ color: 'var(--color-error)', marginLeft: 'var(--space-2)' }}>
                      • {fileWithProgress.error}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {fileWithProgress.progress > 0 && fileWithProgress.progress < 100 && (
                  <div style={{
                    marginTop: 'var(--space-2)',
                    height: '4px',
                    backgroundColor: 'var(--color-gray-200)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${fileWithProgress.progress}%`,
                      height: '100%',
                      backgroundColor: 'var(--color-primary)',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                )}
              </div>

              {isUploading && fileWithProgress.progress > 0 && fileWithProgress.progress < 100 ? (
                <Spinner size="small" />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--space-1)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IconClose size={16} color="var(--color-gray-500)" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;

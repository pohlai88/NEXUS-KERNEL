/**
 * FileManager Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Phase 12 - Enterprise & Admin Components
 * 
 * File browser with upload, preview, folder navigation, search,
 * and drag-drop support.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type FileType = 'folder' | 'image' | 'video' | 'audio' | 'document' | 'code' | 'archive' | 'other';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'size' | 'date' | 'type';
export type SortOrder = 'asc' | 'desc';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size?: number;
  modifiedAt: Date;
  createdAt?: Date;
  parentId?: string | null;
  path: string;
  thumbnail?: string;
  icon?: string;
  mimeType?: string;
  tags?: string[];
  starred?: boolean;
  shared?: boolean;
}

export interface FileManagerProps {
  files: FileItem[];
  onFileSelect?: (file: FileItem) => void;
  onFileOpen?: (file: FileItem) => void;
  onFileDelete?: (fileIds: string[]) => void;
  onFileRename?: (fileId: string, newName: string) => void;
  onFileMove?: (fileIds: string[], targetFolderId: string) => void;
  onFilesUpload?: (files: File[], parentId?: string) => void;
  onFolderCreate?: (name: string, parentId?: string) => void;
  allowMultiSelect?: boolean;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowRename?: boolean;
  showBreadcrumb?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  defaultView?: ViewMode;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getFileIcon = (type: FileType, mimeType?: string): string => {
  if (type === 'folder') return '📁';
  if (type === 'image') return '🖼️';
  if (type === 'video') return '🎬';
  if (type === 'audio') return '🎵';
  if (type === 'archive') return '📦';
  if (type === 'code') return '💻';
  if (type === 'document') {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('word')) return '📝';
    if (mimeType?.includes('sheet')) return '📊';
    if (mimeType?.includes('presentation')) return '📑';
    return '📄';
  }
  return '📎';
};

const getFileTypeColor = (type: FileType): string => {
  const colors: Record<FileType, string> = {
    folder: 'text-yellow-400',
    image: 'text-purple-400',
    video: 'text-red-400',
    audio: 'text-green-400',
    document: 'text-blue-400',
    code: 'text-cyan-400',
    archive: 'text-orange-400',
    other: 'text-gray-400',
  };
  return colors[type];
};

// ============================================================================
// Main Component
// ============================================================================

export const FileManager: React.FC<FileManagerProps> = ({
  files,
  onFileSelect,
  onFileOpen,
  onFileDelete,
  onFileRename,
  onFileMove,
  onFilesUpload,
  onFolderCreate,
  allowMultiSelect = true,
  allowUpload = true,
  allowDelete = true,
  allowRename = true,
  showBreadcrumb = true,
  showSearch = true,
  showFilters = true,
  defaultView = 'grid',
  className = '',
}) => {
  // State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Get current folder
  const currentFolder = files.find(f => f.id === currentFolderId);
  
  // Get breadcrumb path
  const breadcrumbPath = useMemo(() => {
    const path: FileItem[] = [];
    let current = currentFolder;
    
    while (current) {
      path.unshift(current);
      current = files.find(f => f.id === current?.parentId) || undefined;
    }
    
    return path;
  }, [currentFolder, files]);

  // Filter and sort files
  const displayedFiles = useMemo(() => {
    let filtered = files.filter(file => file.parentId === currentFolderId);
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(query) ||
        file.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      // Always show folders first
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'date':
          comparison = a.modifiedAt.getTime() - b.modifiedAt.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [files, currentFolderId, searchQuery, sortBy, sortOrder]);

  // Handlers
  const handleFileClick = useCallback((file: FileItem, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      if (allowMultiSelect) {
        const newSelected = new Set(selectedFiles);
        if (newSelected.has(file.id)) {
          newSelected.delete(file.id);
        } else {
          newSelected.add(file.id);
        }
        setSelectedFiles(newSelected);
      }
    } else if (file.type === 'folder') {
      setCurrentFolderId(file.id);
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set([file.id]));
      if (onFileSelect) {
        onFileSelect(file);
      }
    }
  }, [allowMultiSelect, selectedFiles, onFileSelect]);

  const handleFileDoubleClick = useCallback((file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentFolderId(file.id);
    } else if (onFileOpen) {
      onFileOpen(file);
    }
  }, [onFileOpen]);

  const handleDelete = useCallback(() => {
    if (onFileDelete && selectedFiles.size > 0) {
      onFileDelete(Array.from(selectedFiles));
      setSelectedFiles(new Set());
    }
  }, [onFileDelete, selectedFiles]);

  const handleRename = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setRenamingFileId(fileId);
      setNewFileName(file.name);
    }
  }, [files]);

  const handleRenameSubmit = useCallback(() => {
    if (renamingFileId && newFileName && onFileRename) {
      onFileRename(renamingFileId, newFileName);
      setRenamingFileId(null);
      setNewFileName('');
    }
  }, [renamingFileId, newFileName, onFileRename]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (onFilesUpload && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      onFilesUpload(fileList, currentFolderId || undefined);
    }
  }, [onFilesUpload, currentFolderId]);

  const handleSort = useCallback((field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`bg-surface-900 border border-surface-700 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="px-4 py-3 bg-surface-800 border-b border-surface-700">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Breadcrumb */}
          {showBreadcrumb && (
            <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
              <button
                onClick={() => setCurrentFolderId(null)}
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                🏠 Root
              </button>
              {breadcrumbPath.map((folder) => (
                <React.Fragment key={folder.id}>
                  <span className="text-gray-600">/</span>
                  <button
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="text-gray-400 hover:text-white transition-colors truncate"
                  >
                    {folder.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-surface-700 rounded p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="List view"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* New Folder */}
            {onFolderCreate && (
              <button
                onClick={() => {
                  const name = prompt('Enter folder name:');
                  if (name) {
                    onFolderCreate(name, currentFolderId || undefined);
                  }
                }}
                className="px-3 py-1.5 bg-surface-700 text-white rounded hover:bg-surface-600 transition-colors text-sm"
                title="New folder"
              >
                📁+
              </button>
            )}

            {/* Upload */}
            {allowUpload && onFilesUpload && (
              <label className="px-3 py-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-sm cursor-pointer">
                ⬆️ Upload
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onFilesUpload(Array.from(e.target.files), currentFolderId || undefined);
                    }
                  }}
                />
              </label>
            )}

            {/* Delete Selected */}
            {allowDelete && selectedFiles.size > 0 && (
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                🗑️ Delete ({selectedFiles.size})
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* File List */}
      <div
        className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="fixed inset-0 bg-primary-500/10 border-2 border-dashed border-primary-500 rounded-lg flex items-center justify-center pointer-events-none z-10">
            <div className="text-2xl text-primary-400">📤 Drop files to upload</div>
          </div>
        )}

        {displayedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-6xl mb-3">📁</div>
            <p className="text-gray-400">
              {searchQuery ? 'No files found' : 'This folder is empty'}
            </p>
            {allowUpload && !searchQuery && (
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop files here or click Upload
              </p>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayedFiles.map((file) => (
              <div
                key={file.id}
                onClick={(e) => handleFileClick(file, e)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedFiles.has(file.id)
                    ? 'bg-primary-500/10 border-primary-500'
                    : 'bg-surface-800 border-surface-700 hover:bg-surface-700 hover:border-surface-600'
                }`}
              >
                {/* Thumbnail/Icon */}
                <div className="aspect-square mb-2 flex items-center justify-center rounded overflow-hidden bg-surface-700">
                  {file.thumbnail ? (
                    <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className={`text-4xl ${getFileTypeColor(file.type)}`}>
                      {getFileIcon(file.type, file.mimeType)}
                    </span>
                  )}
                </div>

                {/* File Info */}
                {renamingFileId === file.id ? (
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit();
                      if (e.key === 'Escape') setRenamingFileId(null);
                    }}
                    className="w-full px-2 py-1 bg-surface-700 border border-primary-500 rounded text-xs text-white"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <p className="text-sm text-white truncate mb-1" title={file.name}>
                      {file.name}
                    </p>
                    {file.type !== 'folder' && (
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    )}
                  </>
                )}

                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {file.starred && <span className="text-yellow-400">⭐</span>}
                  {allowRename && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(file.id);
                      }}
                      className="p-1 bg-surface-900/80 rounded hover:bg-surface-800"
                      title="Rename"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-surface-700">
              <div className="col-span-6 flex items-center gap-2 cursor-pointer" onClick={() => handleSort('name')}>
                Name
                {sortBy === 'name' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
              <div className="col-span-2 cursor-pointer" onClick={() => handleSort('size')}>
                Size
                {sortBy === 'size' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
              <div className="col-span-2 cursor-pointer" onClick={() => handleSort('type')}>
                Type
                {sortBy === 'type' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
              <div className="col-span-2 cursor-pointer" onClick={() => handleSort('date')}>
                Modified
                {sortBy === 'date' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
              </div>
            </div>

            {/* Table Rows */}
            {displayedFiles.map((file) => (
              <div
                key={file.id}
                onClick={(e) => handleFileClick(file, e)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                className={`grid grid-cols-12 gap-4 px-4 py-2 rounded transition-all cursor-pointer ${
                  selectedFiles.has(file.id)
                    ? 'bg-primary-500/10'
                    : 'hover:bg-surface-800'
                }`}
              >
                <div className="col-span-6 flex items-center gap-3 min-w-0">
                  <span className={`text-2xl flex-shrink-0 ${getFileTypeColor(file.type)}`}>
                    {getFileIcon(file.type, file.mimeType)}
                  </span>
                  {renamingFileId === file.id ? (
                    <input
                      type="text"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit();
                        if (e.key === 'Escape') setRenamingFileId(null);
                      }}
                      className="flex-1 px-2 py-1 bg-surface-700 border border-primary-500 rounded text-sm text-white"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-sm text-white truncate" title={file.name}>
                      {file.name}
                    </span>
                  )}
                  {file.starred && <span className="text-yellow-400 flex-shrink-0">⭐</span>}
                </div>
                <div className="col-span-2 flex items-center text-sm text-gray-400">
                  {formatFileSize(file.size)}
                </div>
                <div className="col-span-2 flex items-center text-sm text-gray-400 capitalize">
                  {file.type}
                </div>
                <div className="col-span-2 flex items-center justify-between text-sm text-gray-400">
                  <span>{formatDate(file.modifiedAt)}</span>
                  {allowRename && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(file.id);
                      }}
                      className="opacity-0 hover:opacity-100 p-1 hover:bg-surface-700 rounded transition-opacity"
                      title="Rename"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-surface-800 border-t border-surface-700 text-sm text-gray-400">
        {selectedFiles.size > 0 ? (
          <span>{selectedFiles.size} item{selectedFiles.size > 1 ? 's' : ''} selected</span>
        ) : (
          <span>{displayedFiles.length} item{displayedFiles.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
};

export default FileManager;

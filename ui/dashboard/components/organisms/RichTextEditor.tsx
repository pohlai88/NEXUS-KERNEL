import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  showToolbar?: boolean;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  readOnly = false,
  showToolbar = true,
  minHeight = '200px',
  maxHeight = '500px',
  className = '',
}: RichTextEditorProps) {
  const [content, setContent] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      onChange?.(html);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  }, [execCommand]);

  const formatBlock = useCallback((tag: string) => {
    execCommand('formatBlock', tag);
  }, [execCommand]);

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid ${isFocused ? 'var(--color-primary)' : 'var(--color-gray-300)'}`,
    borderRadius: 'var(--radius-lg)',
    backgroundColor: '#FFFFFF',
    transition: 'border-color 0.2s ease',
    overflow: 'hidden',
  };

  const toolbarStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--space-1)',
    padding: 'var(--space-3)',
    borderBottom: '1px solid var(--color-gray-200)',
    backgroundColor: 'var(--color-gray-50)',
  };

  const toolbarGroupStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--space-1)',
    paddingRight: 'var(--space-3)',
    borderRight: '1px solid var(--color-gray-300)',
  };

  const toolbarButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    padding: 0,
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'var(--color-gray-700)',
  };

  const selectStyles: React.CSSProperties = {
    padding: 'var(--space-2) var(--space-3)',
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-700)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const editorStyles: React.CSSProperties = {
    padding: 'var(--space-4)',
    minHeight,
    maxHeight,
    overflowY: 'auto',
    fontSize: 'var(--text-body-size)',
    lineHeight: 1.6,
    color: 'var(--color-gray-900)',
    outline: 'none',
    cursor: readOnly ? 'default' : 'text',
  };

  const placeholderStyles: React.CSSProperties = {
    position: 'absolute',
    top: 'var(--space-4)',
    left: 'var(--space-4)',
    pointerEvents: 'none',
    color: 'var(--color-gray-400)',
    fontSize: 'var(--text-body-size)',
  };

  const ToolbarButton = ({
    label,
    command,
    title,
    value,
  }: {
    label: string;
    command?: string;
    title: string;
    value?: string;
  }) => (
    <button
      type="button"
      title={title}
      style={{...toolbarButtonStyles, fontSize: '14px', fontWeight: 600}}
      onClick={() => {
        if (command === 'createLink') {
          insertLink();
        } else if (command === 'insertImage') {
          insertImage();
        } else if (command) {
          execCommand(command, value);
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
        e.currentTarget.style.borderColor = 'var(--color-gray-300)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      {label}
    </button>
  );

  return (
    <div className={className} style={containerStyles}>
      {showToolbar && !readOnly && (
        <div style={toolbarStyles}>
          {/* Text Formatting */}
          <div style={toolbarGroupStyles}>
            <select
              style={selectStyles}
              onChange={(e) => formatBlock(e.target.value)}
              defaultValue=""
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-gray-300)';
              }}
            >
              <option value="">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
              <option value="pre">Code Block</option>
            </select>
          </div>

          {/* Text Style */}
          <div style={toolbarGroupStyles}>
            <ToolbarButton label="B" command="bold" title="Bold (Ctrl+B)" />
            <ToolbarButton label="I" command="italic" title="Italic (Ctrl+I)" />
            <ToolbarButton label="U" command="underline" title="Underline (Ctrl+U)" />
            <ToolbarButton label="<>" command="formatBlock" title="Code" value="pre" />
          </div>

          {/* Alignment */}
          <div style={toolbarGroupStyles}>
            <button
              type="button"
              title="Align Left"
              style={toolbarButtonStyles}
              onClick={() => execCommand('justifyLeft')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
                e.currentTarget.style.borderColor = 'var(--color-gray-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 600 }}>‹</span>
            </button>
            <button
              type="button"
              title="Align Center"
              style={toolbarButtonStyles}
              onClick={() => execCommand('justifyCenter')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
                e.currentTarget.style.borderColor = 'var(--color-gray-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 600 }}>·</span>
            </button>
            <button
              type="button"
              title="Align Right"
              style={toolbarButtonStyles}
              onClick={() => execCommand('justifyRight')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
                e.currentTarget.style.borderColor = 'var(--color-gray-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 600 }}>›</span>
            </button>
          </div>

          {/* Lists */}
          <div style={toolbarGroupStyles}>
            <ToolbarButton
              label="•"
              command="insertUnorderedList"
              title="Bullet List"
            />
            <button
              type="button"
              title="Numbered List"
              style={{...toolbarButtonStyles, fontSize: '14px', fontWeight: 600}}
              onClick={() => execCommand('insertOrderedList')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
                e.currentTarget.style.borderColor = 'var(--color-gray-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              1.
            </button>
          </div>

          {/* Insert */}
          <div style={{ ...toolbarGroupStyles, borderRight: 'none' }}>
            <ToolbarButton label="🔗" command="createLink" title="Insert Link" />
            <ToolbarButton label="📷" command="insertImage" title="Insert Image" />
          </div>
        </div>
      )}

      {/* Editor */}
      <div style={{ position: 'relative' }}>
        {!content && !isFocused && (
          <div style={placeholderStyles}>{placeholder}</div>
        )}
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          style={editorStyles}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}

export default RichTextEditor;

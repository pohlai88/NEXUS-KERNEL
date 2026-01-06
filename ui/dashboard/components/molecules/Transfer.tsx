import React, { useState } from 'react';
import { IconChevronRight, IconChevronLeft, IconSearch } from '../atoms/icons';

export interface TransferItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TransferProps {
  sourceItems: TransferItem[];
  targetItems: TransferItem[];
  onChange?: (sourceItems: TransferItem[], targetItems: TransferItem[]) => void;
  titles?: [string, string];
  showSearch?: boolean;
  disabled?: boolean;
  className?: string;
}

interface ListBoxProps {
  title: string;
  items: TransferItem[];
  selectedKeys: Set<string>;
  onToggleSelect: (key: string) => void;
  onSelectAll: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch?: boolean;
  disabled?: boolean;
}

function ListBox({
  title,
  items,
  selectedKeys,
  onToggleSelect,
  onSelectAll,
  searchQuery,
  onSearchChange,
  showSearch,
  disabled,
}: ListBoxProps) {
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectableItems = filteredItems.filter((item) => !item.disabled);
  const allSelected = selectableItems.length > 0 && selectableItems.every((item) => selectedKeys.has(item.key));

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '220px',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-3) var(--space-4)',
    backgroundColor: 'var(--color-gray-50)',
    borderBottom: '1px solid var(--color-gray-200)',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
  };

  const countStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    color: 'var(--color-gray-600)',
  };

  const searchContainerStyles: React.CSSProperties = {
    position: 'relative',
    padding: 'var(--space-3)',
    borderBottom: '1px solid var(--color-gray-200)',
  };

  const searchInputStyles: React.CSSProperties = {
    width: '100%',
    padding: 'var(--space-2) var(--space-3) var(--space-2) var(--space-8)',
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-900)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-300)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
  };

  const searchIconStyles: React.CSSProperties = {
    position: 'absolute',
    left: 'calc(var(--space-3) + var(--space-2))',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-gray-400)',
    pointerEvents: 'none',
  };

  const selectAllContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-4)',
    borderBottom: '1px solid var(--color-gray-200)',
    backgroundColor: 'var(--color-gray-50)',
  };

  const checkboxStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const selectAllLabelStyles: React.CSSProperties = {
    fontSize: 'var(--text-caption-size)',
    fontWeight: 500,
    color: 'var(--color-gray-700)',
  };

  const listStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '300px',
    overflowY: 'auto',
  };

  const itemStyles = (item: TransferItem, isSelected: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-4)',
    cursor: item.disabled || disabled ? 'not-allowed' : 'pointer',
    backgroundColor: isSelected ? 'var(--color-primary-50)' : 'transparent',
    opacity: item.disabled ? 0.5 : 1,
    transition: 'background-color 0.15s ease',
  });

  const itemLabelStyles = (isSelected: boolean): React.CSSProperties => ({
    flex: 1,
    fontSize: 'var(--text-body-size)',
    color: isSelected ? 'var(--color-primary)' : 'var(--color-gray-900)',
  });

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <span style={titleStyles}>{title}</span>
        <span style={countStyles}>
          {selectedKeys.size} / {items.length} items
        </span>
      </div>

      {/* Search */}
      {showSearch && (
        <div style={searchContainerStyles}>
          <div style={searchIconStyles}>
            <IconSearch size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items..."
            style={searchInputStyles}
            disabled={disabled}
          />
        </div>
      )}

      {/* Select All */}
      <div style={selectAllContainerStyles}>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onSelectAll}
          style={checkboxStyles}
          disabled={disabled || selectableItems.length === 0}
        />
        <span style={selectAllLabelStyles}>Select all</span>
      </div>

      {/* Item List */}
      <div style={listStyles}>
        {filteredItems.map((item) => {
          const isSelected = selectedKeys.has(item.key);
          return (
            <div
              key={item.key}
              style={itemStyles(item, isSelected)}
              onClick={() => {
                if (!item.disabled && !disabled) {
                  onToggleSelect(item.key);
                }
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && !disabled && !isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  if (!item.disabled && !disabled) {
                    onToggleSelect(item.key);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                style={checkboxStyles}
                disabled={item.disabled || disabled}
              />
              <span style={itemLabelStyles(isSelected)}>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Transfer({
  sourceItems,
  targetItems,
  onChange,
  titles = ['Source', 'Target'],
  showSearch = true,
  disabled = false,
  className = '',
}: TransferProps) {
  const [sourceSelectedKeys, setSourceSelectedKeys] = useState<Set<string>>(new Set());
  const [targetSelectedKeys, setTargetSelectedKeys] = useState<Set<string>>(new Set());
  const [sourceSearchQuery, setSourceSearchQuery] = useState('');
  const [targetSearchQuery, setTargetSearchQuery] = useState('');

  const handleMoveToTarget = () => {
    if (disabled) return;
    const itemsToMove = sourceItems.filter((item) => sourceSelectedKeys.has(item.key));
    const newSourceItems = sourceItems.filter((item) => !sourceSelectedKeys.has(item.key));
    const newTargetItems = [...targetItems, ...itemsToMove];
    setSourceSelectedKeys(new Set());
    onChange?.(newSourceItems, newTargetItems);
  };

  const handleMoveToSource = () => {
    if (disabled) return;
    const itemsToMove = targetItems.filter((item) => targetSelectedKeys.has(item.key));
    const newTargetItems = targetItems.filter((item) => !targetSelectedKeys.has(item.key));
    const newSourceItems = [...sourceItems, ...itemsToMove];
    setTargetSelectedKeys(new Set());
    onChange?.(newSourceItems, newTargetItems);
  };

  const handleMoveAllToTarget = () => {
    if (disabled) return;
    const newTargetItems = [...targetItems, ...sourceItems];
    setSourceSelectedKeys(new Set());
    onChange?.([], newTargetItems);
  };

  const handleMoveAllToSource = () => {
    if (disabled) return;
    const newSourceItems = [...sourceItems, ...targetItems];
    setTargetSelectedKeys(new Set());
    onChange?.(newSourceItems, []);
  };

  const handleToggleSourceSelect = (key: string) => {
    setSourceSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleToggleTargetSelect = (key: string) => {
    setTargetSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSelectAllSource = () => {
    const filteredItems = sourceItems.filter((item) =>
      item.label.toLowerCase().includes(sourceSearchQuery.toLowerCase()) && !item.disabled
    );
    const allSelected = filteredItems.every((item) => sourceSelectedKeys.has(item.key));
    if (allSelected) {
      setSourceSelectedKeys(new Set());
    } else {
      setSourceSelectedKeys(new Set(filteredItems.map((item) => item.key)));
    }
  };

  const handleSelectAllTarget = () => {
    const filteredItems = targetItems.filter((item) =>
      item.label.toLowerCase().includes(targetSearchQuery.toLowerCase()) && !item.disabled
    );
    const allSelected = filteredItems.every((item) => targetSelectedKeys.has(item.key));
    if (allSelected) {
      setTargetSelectedKeys(new Set());
    } else {
      setTargetSelectedKeys(new Set(filteredItems.map((item) => item.key)));
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
  };

  const controlsStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  };

  const buttonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    padding: 0,
    backgroundColor: 'var(--color-primary)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
  };

  return (
    <div className={className} style={containerStyles}>
      <ListBox
        title={titles[0]}
        items={sourceItems}
        selectedKeys={sourceSelectedKeys}
        onToggleSelect={handleToggleSourceSelect}
        onSelectAll={handleSelectAllSource}
        searchQuery={sourceSearchQuery}
        onSearchChange={setSourceSearchQuery}
        showSearch={showSearch}
        disabled={disabled}
      />

      <div style={controlsStyles}>
        <button
          onClick={handleMoveToTarget}
          disabled={disabled || sourceSelectedKeys.size === 0}
          style={buttonStyles}
          onMouseEnter={(e) => {
            if (!disabled && sourceSelectedKeys.size > 0) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }}
        >
          <IconChevronRight size={20} />
        </button>
        <button
          onClick={handleMoveToSource}
          disabled={disabled || targetSelectedKeys.size === 0}
          style={buttonStyles}
          onMouseEnter={(e) => {
            if (!disabled && targetSelectedKeys.size > 0) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-600)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
          }}
        >
          <IconChevronLeft size={20} />
        </button>
      </div>

      <ListBox
        title={titles[1]}
        items={targetItems}
        selectedKeys={targetSelectedKeys}
        onToggleSelect={handleToggleTargetSelect}
        onSelectAll={handleSelectAllTarget}
        searchQuery={targetSearchQuery}
        onSearchChange={setTargetSearchQuery}
        showSearch={showSearch}
        disabled={disabled}
      />
    </div>
  );
}

export default Transfer;

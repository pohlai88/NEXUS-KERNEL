import React, { useState } from 'react';
import { IconChevronRight, IconChevronDown } from '../atoms/icons';

export interface TreeNode {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps {
  data: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  showCheckboxes?: boolean;
  defaultExpanded?: string[];
  className?: string;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  expandedNodes: Set<string>;
  selectedNodes: Set<string>;
  onToggleExpand: (key: string) => void;
  onToggleSelect: (key: string, node: TreeNode) => void;
  onSelect?: (node: TreeNode) => void;
  showCheckboxes?: boolean;
}

function TreeNodeItem({
  node,
  level,
  expandedNodes,
  selectedNodes,
  onToggleExpand,
  onToggleSelect,
  onSelect,
  showCheckboxes,
}: TreeNodeItemProps) {
  const isExpanded = expandedNodes.has(node.key);
  const isSelected = selectedNodes.has(node.key);
  const hasChildren = node.children && node.children.length > 0;

  const nodeStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-3)',
    paddingLeft: `calc(var(--space-3) + var(--space-4) * ${level})`,
    cursor: node.disabled ? 'not-allowed' : 'pointer',
    backgroundColor: isSelected ? 'var(--color-primary-50)' : 'transparent',
    opacity: node.disabled ? 0.5 : 1,
    transition: 'background-color 0.15s ease',
  };

  const chevronStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    visibility: hasChildren ? 'visible' : 'hidden',
    color: 'var(--color-gray-600)',
  };

  const iconStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    color: 'var(--color-primary)',
  };

  const labelStyles: React.CSSProperties = {
    flex: 1,
    fontSize: 'var(--text-body-size)',
    fontWeight: 500,
    color: isSelected ? 'var(--color-primary)' : 'var(--color-gray-900)',
  };

  const checkboxStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
    cursor: node.disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <>
      <div
        style={nodeStyles}
        onClick={() => {
          if (node.disabled) return;
          if (hasChildren) {
            onToggleExpand(node.key);
          }
          onSelect?.(node);
        }}
        onMouseEnter={(e) => {
          if (!node.disabled && !isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div
          style={chevronStyles}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren && !node.disabled) {
              onToggleExpand(node.key);
            }
          }}
        >
          {hasChildren && (
            isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />
          )}
        </div>

        {showCheckboxes && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {
              if (!node.disabled) {
                onToggleSelect(node.key, node);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            style={checkboxStyles}
            disabled={node.disabled}
          />
        )}

        {node.icon && <div style={iconStyles}>{node.icon}</div>}

        <div style={labelStyles}>{node.label}</div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.key}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              selectedNodes={selectedNodes}
              onToggleExpand={onToggleExpand}
              onToggleSelect={onToggleSelect}
              onSelect={onSelect}
              showCheckboxes={showCheckboxes}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function TreeView({
  data,
  onSelect,
  showCheckboxes = false,
  defaultExpanded = [],
  className = '',
}: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(defaultExpanded));
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());

  const handleToggleExpand = (key: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleToggleSelect = (key: string, node: TreeNode) => {
    setSelectedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    onSelect?.(node);
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  };

  return (
    <div className={className} style={containerStyles}>
      {data.map((node) => (
        <TreeNodeItem
          key={node.key}
          node={node}
          level={0}
          expandedNodes={expandedNodes}
          selectedNodes={selectedNodes}
          onToggleExpand={handleToggleExpand}
          onToggleSelect={handleToggleSelect}
          onSelect={onSelect}
          showCheckboxes={showCheckboxes}
        />
      ))}
    </div>
  );
}

export default TreeView;

'use client';

import React, { useState } from 'react';

export interface Tab {
  /** Unique tab identifier */
  id: string;
  /** Tab label */
  label: string;
  /** Tab content */
  content: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Icon (optional) */
  icon?: React.ReactNode;
  /** Badge count (optional) */
  badge?: number;
}

export interface TabsProps {
  /** Array of tab configurations */
  tabs: Tab[];
  /** Default active tab ID */
  defaultTab?: string;
  /** Controlled active tab ID */
  activeTab?: string;
  /** Tab change handler */
  onChange?: (tabId: string) => void;
  /** Style variant */
  variant?: 'underline' | 'pills' | 'enclosed';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Tabs Component - Material Design 3 with Quantum Obsidian tokens
 * 
 * Features:
 * - 3 style variants (underline, pills, enclosed)
 * - Smooth indicator animation
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Badge support for notifications
 * - Icon support
 * - P3 Wide Gamut OKLCH colors
 * 
 * @example
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { id: 'overview', label: 'Overview', content: <Overview /> },
 *     { id: 'analytics', label: 'Analytics', content: <Analytics />, badge: 3 },
 *   ]}
 *   defaultTab="overview"
 * />
 * ```
 */
export default function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'underline',
  fullWidth = false,
  className = '',
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;
    setInternalActiveTab(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentEnabledIndex = enabledTabs.findIndex((t) => t.id === tabs[currentIndex].id);

    let nextIndex = currentEnabledIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = enabledTabs.length - 1;
        break;
      default:
        return;
    }

    handleTabClick(enabledTabs[nextIndex].id);
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab List */}
      <div
        role="tablist"
        className="flex"
        style={{
          borderBottom: variant === 'underline' ? '1px solid var(--color-border)' : undefined,
          gap: variant === 'pills' ? 'var(--space-2)' : variant === 'enclosed' ? 'var(--space-1)' : 0,
          width: fullWidth ? '100%' : undefined,
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              aria-disabled={isDisabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabClick(tab.id, isDisabled)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={isDisabled}
              className="inline-flex items-center justify-center gap-2 relative"
              style={{
                padding:
                  variant === 'underline'
                    ? 'var(--space-3) var(--space-4)'
                    : 'var(--space-2) var(--space-4)',
                fontSize: 'var(--type-body-size)',
                lineHeight: 'var(--type-body-line)',
                fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                color: isDisabled
                  ? 'var(--color-text-faint)'
                  : isActive
                  ? variant === 'pills'
                    ? 'var(--color-primary-foreground)'
                    : 'var(--color-primary)'
                  : 'var(--color-text-sub)',
                backgroundColor:
                  variant === 'pills' && isActive
                    ? 'var(--color-primary)'
                    : variant === 'enclosed' && isActive
                    ? 'var(--color-surface)'
                    : 'transparent',
                border: variant === 'enclosed' ? '1px solid var(--color-border)' : 'none',
                borderBottom: variant === 'enclosed' && isActive ? '1px solid var(--color-surface)' : undefined,
                borderTopLeftRadius: variant === 'enclosed' ? 'var(--radius-md)' : variant === 'pills' ? 'var(--radius-sm)' : 0,
                borderTopRightRadius: variant === 'enclosed' ? 'var(--radius-md)' : variant === 'pills' ? 'var(--radius-sm)' : 0,
                borderBottomLeftRadius: variant === 'pills' ? 'var(--radius-sm)' : 0,
                borderBottomRightRadius: variant === 'pills' ? 'var(--radius-sm)' : 0,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all var(--dur-fast) var(--ease-standard)',
                flex: fullWidth ? '1' : undefined,
                marginBottom: variant === 'enclosed' && isActive ? '-1px' : undefined,
                zIndex: variant === 'enclosed' && isActive ? 1 : 0,
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isActive && variant !== 'pills') {
                  e.currentTarget.style.color = 'var(--color-text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && variant !== 'pills') {
                  e.currentTarget.style.color = 'var(--color-text-sub)';
                }
              }}
            >
              {/* Icon */}
              {tab.icon && (
                <span className="inline-flex items-center justify-center" style={{ width: '16px', height: '16px' }}>
                  {tab.icon}
                </span>
              )}

              {/* Label */}
              <span>{tab.label}</span>

              {/* Badge */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className="inline-flex items-center justify-center"
                  style={{
                    minWidth: '1.25rem',
                    height: '1.25rem',
                    padding: '0 var(--space-1)',
                    fontSize: 'var(--type-micro-size)',
                    lineHeight: 'var(--type-micro-line)',
                    fontWeight: 'var(--weight-semibold)',
                    color: isActive && variant === 'pills' ? 'var(--color-primary)' : 'white',
                    backgroundColor: isActive && variant === 'pills' ? 'white' : 'var(--color-primary)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}

              {/* Underline Indicator */}
              {variant === 'underline' && isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: '2px',
                    backgroundColor: 'var(--color-primary)',
                    borderTopLeftRadius: '1px',
                    borderTopRightRadius: '1px',
                    animation: 'slideIn var(--dur-base) var(--ease-emphasized)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={activeTab}
        style={{
          padding: 'var(--space-6) 0',
        }}
      >
        {activeContent}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scaleX(0.8);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}

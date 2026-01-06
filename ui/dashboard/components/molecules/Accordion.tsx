import React, { useState } from 'react';
import { IconChevronDown } from '../atoms/icons';

// Accordion Item Interface
export interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  icon,
  defaultExpanded = false,
  disabled = false,
  className = '',
}: AccordionItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const itemStyles: React.CSSProperties = {
    borderBottom: '1px solid var(--color-gray-200)',
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-4)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: isExpanded ? 'var(--color-gray-50)' : 'transparent',
    transition: 'background-color 0.2s ease',
    userSelect: 'none',
  };

  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-primary)',
    fontSize: '20px',
  };

  const titleStyles: React.CSSProperties = {
    flex: 1,
    fontSize: 'var(--text-body-size)',
    fontWeight: 600,
    color: 'var(--color-gray-900)',
  };

  const chevronStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-gray-600)',
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s ease',
  };

  const contentWrapperStyles: React.CSSProperties = {
    maxHeight: isExpanded ? '1000px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
  };

  const contentStyles: React.CSSProperties = {
    padding: isExpanded ? 'var(--space-4)' : '0 var(--space-4)',
    fontSize: 'var(--text-body-size)',
    color: 'var(--color-gray-700)',
    lineHeight: 1.6,
  };

  return (
    <div className={className} style={itemStyles}>
      <div
        style={headerStyles}
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          if (!disabled && !isExpanded) {
            e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isExpanded) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {icon && <div style={iconContainerStyles}>{icon}</div>}
        <div style={titleStyles}>{title}</div>
        <div style={chevronStyles}>
          <IconChevronDown size={20} />
        </div>
      </div>
      <div style={contentWrapperStyles}>
        <div style={contentStyles}>{children}</div>
      </div>
    </div>
  );
}

// Accordion Container Interface
export interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  children,
  allowMultiple = false,
  className = '',
}: AccordionProps) {
  const accordionStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-gray-200)',
    overflow: 'hidden',
  };

  // Note: allowMultiple would require lifting state up
  // For now, each AccordionItem manages its own state
  // Future enhancement: controlled accordion state

  return (
    <div className={className} style={accordionStyles}>
      {children}
    </div>
  );
}

export default Accordion;

/**
 * TableRow - Individual table row with expandable details and context menu
 * Based on Figma design: nodes 423:4410 (main table), 129:3 (single row), 419:9156 (context menu)
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { TableRowProps } from './types';

export function TableRow({
  user,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onViewMore,
  onEdit,
  onViewProfile,
  onActivate,
  onDelete,
}: TableRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <>
      <tr className="border-b border-nx-border hover:bg-nx-surface-well transition-colors">
        <td className="py-4 px-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-5 h-5 rounded"
            style={{ accentColor: 'var(--color-primary)' }}
          />
        </td>
        
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center
                         bg-nx-surface-well text-nx-text-sub font-medium"
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="text-body font-medium text-nx-text-main">{user.name}</div>
              <div className="text-caption text-nx-text-muted">{user.email}</div>
            </div>
          </div>
        </td>

        <td className="py-4 px-4">
          <StatusBadge type="user" status={user.userStatus} />
          <div className="text-caption text-nx-text-muted mt-1">
            Last login: {user.lastLogin}
          </div>
        </td>

        <td className="py-4 px-4">
          <StatusBadge type="payment" status={user.paymentStatus} />
          <div className="text-caption text-nx-text-muted mt-1">
            {user.paymentStatus === 'Paid' ? 'Paid on' : 'Dues on'} {user.paymentDate}
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="text-body font-semibold text-nx-text-main">
            ${user.amount}
          </div>
          <div className="text-caption text-nx-text-muted">{user.currency}</div>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewMore(user.id)}
              className="text-body text-(--color-primary) font-medium
                         hover:underline"
            >
              View More
            </button>
            
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-nx-surface-well rounded transition-colors"
              >
                <MoreVertical size={18} className="text-nx-text-sub" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 bg-nx-surface rounded-lg
                             shadow-lg border border-nx-border py-2 z-50"
                  style={{ 
                    width: '180px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <button
                    onClick={() => { onEdit(user.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-body hover:bg-nx-surface-well
                               transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { onViewProfile(user.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-body hover:bg-nx-surface-well
                               transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => { onActivate(user.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-body hover:bg-nx-surface-well
                               transition-colors"
                    style={{ color: 'var(--color-success)' }}
                  >
                    Activate User
                  </button>
                  <button
                    onClick={() => { onDelete(user.id); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-body hover:bg-nx-surface-well
                               transition-colors"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-nx-surface-well rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp size={18} className="text-nx-text-sub" />
              ) : (
                <ChevronDown size={18} className="text-nx-text-sub" />
              )}
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && user.activityDetails && (
        <tr className="bg-nx-canvas border-b border-nx-border">
          <td colSpan={6} className="py-4 px-4">
            <div className="ml-14 grid grid-cols-3 gap-6">
              {user.activityDetails.map((detail, idx) => (
                <div key={idx}>
                  <div className="text-caption font-semibold text-nx-text-sub mb-1">
                    {idx === 0 ? 'DATE' : idx === 1 ? 'USER ACTIVITY' : 'DETAIL'}
                  </div>
                  <div className="text-body text-nx-text-sub">
                    {idx === 0 ? detail.date : idx === 1 ? detail.userActivity : detail.detail}
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

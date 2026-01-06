/**
 * NotificationCenter Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Phase 12 - Enterprise & Admin Components
 * 
 * Real-time notification hub with filtering, read/unread states,
 * action buttons, and timestamp display.
 */

'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'mention' | 'update';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  avatar?: string;
  icon?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, unknown>;
}

export interface NotificationCenterProps {
  notifications: Notification[];
  onNotificationRead?: (id: string) => void;
  onNotificationDelete?: (id: string) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  maxHeight?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  groupByDate?: boolean;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTypeColor = (type: NotificationType): string => {
  const colors: Record<NotificationType, string> = {
    info: 'text-nx-info',
    success: 'text-nx-success',
    warning: 'text-nx-warning',
    error: 'text-nx-danger',
    mention: 'text-nx-primary',
    update: 'text-cyan-400',
  };
  return colors[type] || 'text-nx-text-faint';
};

const getTypeBgColor = (type: NotificationType): string => {
  const colors: Record<NotificationType, string> = {
    info: 'bg-nx-info-bg',
    success: 'bg-nx-success-bg',
    warning: 'bg-nx-warning-bg',
    error: 'bg-nx-danger-bg',
    mention: 'bg-nx-primary-light',
    update: 'bg-nx-info-bg',
  };
  return colors[type] || 'bg-nx-surface-well';
};

const getPriorityIndicator = (priority: NotificationPriority): string => {
  const indicators: Record<NotificationPriority, string> = {
    low: 'bg-nx-secondary',
    medium: 'bg-nx-warning',
    high: 'bg-nx-warning',
    urgent: 'bg-nx-danger animate-pulse',
  };
  return indicators[priority] || 'bg-nx-secondary';
};

const getTypeIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    mention: '@',
    update: '🔔',
  };
  return icons[type] || '🔔';
};

// ============================================================================
// Main Component
// ============================================================================

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onNotificationRead,
  onNotificationDelete,
  onMarkAllRead,
  onClearAll,
  maxHeight = 600,
  showFilters = true,
  showSearch = true,
  groupByDate = true,
  className = '',
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<NotificationType>>(new Set());
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (selectedTypes.size > 0) {
      filtered = filtered.filter((n) => selectedTypes.has(n.type));
    }

    // Unread filter
    if (showUnreadOnly) {
      filtered = filtered.filter((n) => !n.read);
    }

    return filtered;
  }, [notifications, searchQuery, selectedTypes, showUnreadOnly]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    if (!groupByDate) {
      return { All: filteredNotifications };
    }

    const groups: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Earlier: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    filteredNotifications.forEach((notification) => {
      const notifDate = new Date(notification.timestamp);
      const notifDay = new Date(
        notifDate.getFullYear(),
        notifDate.getMonth(),
        notifDate.getDate()
      );

      if (notifDay.getTime() === today.getTime()) {
        groups.Today.push(notification);
      } else if (notifDay.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notification);
      } else if (notifDay >= weekAgo) {
        groups['This Week'].push(notification);
      } else {
        groups.Earlier.push(notification);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach((key) => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });

    return groups;
  }, [filteredNotifications, groupByDate]);

  // Stats
  const unreadCount = notifications.filter((n) => !n.read).length;
  const allTypes: NotificationType[] = ['info', 'success', 'warning', 'error', 'mention', 'update'];

  // Handlers
  const handleTypeToggle = (type: NotificationType) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onNotificationRead) {
      onNotificationRead(notification.id);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={`bg-surface-900 border border-surface-700 rounded-lg shadow-lg ${className}`}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium text-white bg-primary-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onMarkAllRead && unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Mark all read
              </button>
            )}
            {onClearAll && notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-nx-danger hover:text-nx-danger transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="space-y-2">
            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              {allTypes.map((type) => {
                const count = notifications.filter((n) => n.type === type).length;
                if (count === 0) return null;

                const isSelected = selectedTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                      isSelected
                        ? `${getTypeBgColor(type)} ${getTypeColor(type)} border ${getTypeColor(type).replace('text-', 'border-')}`
                        : 'bg-surface-800 text-nx-text-faint hover:bg-surface-700'
                    }`}
                  >
                    {getTypeIcon(type)} {type} ({count})
                  </button>
                );
              })}
            </div>

            {/* Unread Filter */}
            <label className="flex items-center gap-2 text-sm text-nx-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-2 focus:ring-primary-500"
              />
              Show unread only ({unreadCount})
            </label>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight - 200}px` }}>
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-nx-text-faint">No notifications</p>
            <p className="text-sm text-nx-text-muted mt-1">
              {searchQuery || selectedTypes.size > 0 || showUnreadOnly
                ? 'Try adjusting your filters'
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
            <div key={group}>
              {/* Group Header */}
              {groupByDate && (
                <div className="sticky top-0 px-4 py-2 bg-surface-800 border-b border-surface-700">
                  <h3 className="text-xs font-semibold text-nx-text-faint uppercase tracking-wider">
                    {group}
                  </h3>
                </div>
              )}

              {/* Group Notifications */}
              {groupNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-surface-700 transition-all cursor-pointer ${
                    notification.read
                      ? 'bg-surface-900 hover:bg-surface-800'
                      : 'bg-surface-800/50 hover:bg-surface-800'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Priority Indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-1 h-full rounded-full ${getPriorityIndicator(
                          notification.priority
                        )}`}
                      />
                    </div>

                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={notification.avatar}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full ${getTypeBgColor(
                            notification.type
                          )} flex items-center justify-center`}
                        >
                          <span className="text-xl">{getTypeIcon(notification.type)}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4
                          className={`text-sm font-medium ${
                            notification.read ? 'text-nx-text-muted' : 'text-white'
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <span className="text-xs text-nx-text-muted flex-shrink-0">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-nx-text-faint mb-2">{notification.message}</p>

                      {/* Actions */}
                      {notification.actions && notification.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {notification.actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                              }}
                              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                action.variant === 'primary'
                                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                                  : action.variant === 'danger'
                                  ? 'bg-nx-danger text-white hover:bg-nx-danger-text'
                                  : 'bg-surface-700 text-nx-text-muted hover:bg-surface-600'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    {onNotificationDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNotificationDelete(notification.id);
                        }}
                        className="flex-shrink-0 text-nx-text-muted hover:text-nx-danger transition-colors"
                        aria-label="Delete notification"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;

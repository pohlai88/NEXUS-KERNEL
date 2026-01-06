/**
 * ActivityLog Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Phase 12 - Enterprise & Admin Components
 * 
 * Timeline-based activity tracking with filtering, grouping,
 * and export functionality.
 */

'use client';

import React, { useState, useMemo } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ActivityType =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'upload'
  | 'download'
  | 'share'
  | 'comment'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'complete'
  | 'error'
  | 'warning'
  | 'info';

export type ActivityCategory = 'user' | 'system' | 'security' | 'data' | 'workflow' | 'all';

export interface ActivityActor {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  type: 'user' | 'system' | 'api';
}

export interface ActivityTarget {
  type: string;
  id: string;
  name: string;
  url?: string;
}

export interface ActivityMetadata {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  duration?: number;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface Activity {
  id: string;
  type: ActivityType;
  category: ActivityCategory;
  actor: ActivityActor;
  action: string;
  description?: string;
  target?: ActivityTarget;
  timestamp: Date;
  metadata?: ActivityMetadata;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

export interface ActivityLogProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  onExport?: (activities: Activity[], format: 'json' | 'csv') => void;
  onRefresh?: () => void;
  showFilters?: boolean;
  showSearch?: boolean;
  showGrouping?: boolean;
  showExport?: boolean;
  defaultCategory?: ActivityCategory;
  maxHeight?: number;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatTimestamp = (date: Date): string => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatTimestamp(date);
};

const getActivityIcon = (type: ActivityType): string => {
  const icons: Record<ActivityType, string> = {
    create: '➕',
    update: '✏️',
    delete: '🗑️',
    login: '🔓',
    logout: '🔒',
    upload: '⬆️',
    download: '⬇️',
    share: '🔗',
    comment: '💬',
    approve: '✅',
    reject: '❌',
    assign: '👤',
    complete: '✔️',
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️',
  };
  return icons[type] || '📝';
};

const getActivityColor = (type: ActivityType): string => {
  const colors: Record<ActivityType, string> = {
    create: 'text-nx-success',
    update: 'text-nx-info',
    delete: 'text-nx-danger',
    login: 'text-nx-success',
    logout: 'text-nx-text-faint',
    upload: 'text-nx-primary',
    download: 'text-cyan-400',
    share: 'text-nx-warning',
    comment: 'text-nx-info',
    approve: 'text-nx-success',
    reject: 'text-nx-danger',
    assign: 'text-nx-primary',
    complete: 'text-nx-success',
    error: 'text-nx-danger',
    warning: 'text-nx-warning',
    info: 'text-nx-info',
  };
  return colors[type] || 'text-nx-text-faint';
};

const getSeverityColor = (severity?: Activity['severity']): string => {
  if (!severity) return 'bg-nx-secondary';
  const colors: Record<NonNullable<Activity['severity']>, string> = {
    low: 'bg-nx-success',
    medium: 'bg-nx-warning',
    high: 'bg-nx-warning',
    critical: 'bg-nx-danger',
  };
  return colors[severity];
};

const getCategoryIcon = (category: ActivityCategory): string => {
  const icons: Record<ActivityCategory, string> = {
    user: '👤',
    system: '⚙️',
    security: '🔒',
    data: '📊',
    workflow: '🔄',
    all: '📋',
  };
  return icons[category];
};

const groupActivitiesByDate = (activities: Activity[]): Record<string, Activity[]> => {
  const groups: Record<string, Activity[]> = {};
  
  activities.forEach((activity) => {
    const date = activity.timestamp;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const activityDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    
    let groupKey: string;
    if (activityDate.getTime() === today.getTime()) {
      groupKey = 'Today';
    } else if (activityDate.getTime() === yesterday.getTime()) {
      groupKey = 'Yesterday';
    } else if (date >= new Date(now.getTime() - 7 * 86400000)) {
      groupKey = 'This Week';
    } else if (date >= new Date(now.getTime() - 30 * 86400000)) {
      groupKey = 'This Month';
    } else {
      groupKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(activity);
  });
  
  return groups;
};

// ============================================================================
// Main Component
// ============================================================================

export const ActivityLog: React.FC<ActivityLogProps> = ({
  activities,
  onActivityClick,
  onExport,
  onRefresh,
  showFilters = true,
  showSearch = true,
  showGrouping = true,
  showExport = true,
  defaultCategory = 'all',
  maxHeight = 600,
  className = '',
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>(defaultCategory);
  const [selectedTypes, setSelectedTypes] = useState<Set<ActivityType>>(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState<Activity['severity'] | 'all'>('all');
  const [showMetadata, setShowMetadata] = useState(false);

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Type filter
    if (selectedTypes.size > 0) {
      filtered = filtered.filter((a) => selectedTypes.has(a.type));
    }

    // Severity filter
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter((a) => a.severity === selectedSeverity);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.action.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query) ||
          a.actor.name.toLowerCase().includes(query) ||
          a.target?.name.toLowerCase().includes(query) ||
          a.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [activities, selectedCategory, selectedTypes, selectedSeverity, searchQuery]);

  // Group activities
  const groupedActivities = useMemo(() => {
    if (!showGrouping) {
      return { All: filteredActivities };
    }
    return groupActivitiesByDate(filteredActivities);
  }, [filteredActivities, showGrouping]);

  // Stats
  const stats = useMemo(() => {
    const categories: Record<ActivityCategory, number> = {
      all: activities.length,
      user: activities.filter((a) => a.category === 'user').length,
      system: activities.filter((a) => a.category === 'system').length,
      security: activities.filter((a) => a.category === 'security').length,
      data: activities.filter((a) => a.category === 'data').length,
      workflow: activities.filter((a) => a.category === 'workflow').length,
    };
    return categories;
  }, [activities]);

  // Handlers
  const handleTypeToggle = (type: ActivityType) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const handleExport = (format: 'json' | 'csv') => {
    if (onExport) {
      onExport(filteredActivities, format);
    }
  };

  const allTypes: ActivityType[] = [
    'create', 'update', 'delete', 'login', 'logout', 'upload', 'download',
    'share', 'comment', 'approve', 'reject', 'assign', 'complete',
    'error', 'warning', 'info',
  ];

  const categories: ActivityCategory[] = ['all', 'user', 'system', 'security', 'data', 'workflow'];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={`bg-surface-900 border border-surface-700 rounded-lg shadow-lg overflow-hidden ${className}`}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-surface-800 border-b border-surface-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Activity Log</h2>
          <div className="flex items-center gap-2">
            {/* Export */}
            {showExport && onExport && (
              <div className="relative group">
                <button className="px-3 py-1.5 bg-surface-700 text-white rounded text-sm hover:bg-surface-600 transition-colors">
                  📥 Export
                </button>
                <div className="absolute right-0 mt-1 bg-surface-800 border border-surface-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => handleExport('json')}
                    className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-surface-700"
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-surface-700"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            )}

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3 py-1.5 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
              >
                🔄 Refresh
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface-700 text-nx-text-faint hover:bg-surface-600'
                }`}
              >
                {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)} (
                {stats[category]})
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        {showSearch && (
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities..."
              className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        )}

        {/* Type Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-3">
            {allTypes.map((type) => {
              const count = activities.filter((a) => a.type === type).length;
              if (count === 0) return null;

              const isSelected = selectedTypes.has(type);
              return (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                    isSelected
                      ? `bg-surface-700 ${getActivityColor(type)} border border-current`
                      : 'bg-surface-800 text-nx-text-muted hover:bg-surface-700'
                  }`}
                >
                  {getActivityIcon(type)} {type} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Additional Filters */}
        <div className="flex items-center gap-4 text-sm">
          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as typeof selectedSeverity)}
            className="px-3 py-1.5 bg-surface-700 border border-surface-600 rounded text-sm text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Show Metadata Toggle */}
          <label className="flex items-center gap-2 text-nx-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={showMetadata}
              onChange={(e) => setShowMetadata(e.target.checked)}
              className="w-4 h-4 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-2 focus:ring-primary-500"
            />
            Show metadata
          </label>
        </div>
      </div>

      {/* Activities List */}
      <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight - 250}px` }}>
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-nx-text-faint">No activities found</p>
            <p className="text-sm text-nx-text-muted mt-1">
              {searchQuery || selectedTypes.size > 0 || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'No recent activity to display'}
            </p>
          </div>
        ) : (
          Object.entries(groupedActivities).map(([group, groupActivities]) => (
            <div key={group}>
              {/* Group Header */}
              {showGrouping && (
                <div className="sticky top-0 px-4 py-2 bg-surface-800 border-b border-surface-700">
                  <h3 className="text-xs font-semibold text-nx-text-faint uppercase tracking-wider">
                    {group}
                  </h3>
                </div>
              )}

              {/* Activities */}
              {groupActivities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => onActivityClick?.(activity)}
                  className={`px-4 py-3 border-b border-surface-700 hover:bg-surface-800 transition-colors ${
                    onActivityClick ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon & Severity */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full bg-surface-800 flex items-center justify-center ${getActivityColor(
                          activity.type
                        )}`}
                      >
                        <span className="text-xl">{getActivityIcon(activity.type)}</span>
                      </div>
                      {activity.severity && (
                        <div
                          className={`w-2 h-2 rounded-full mt-1 ${getSeverityColor(
                            activity.severity
                          )}`}
                          title={`Severity: ${activity.severity}`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Actor & Action */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            <span className="font-semibold">{activity.actor.name}</span>{' '}
                            <span className="text-nx-text-faint">{activity.action}</span>
                            {activity.target && (
                              <>
                                {' '}
                                <span className="text-nx-text-faint">on</span>{' '}
                                {activity.target.url ? (
                                  <a
                                    href={activity.target.url}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-primary-400 hover:underline"
                                  >
                                    {activity.target.name}
                                  </a>
                                ) : (
                                  <span className="text-white font-medium">{activity.target.name}</span>
                                )}
                              </>
                            )}
                          </p>
                          {activity.description && (
                            <p className="text-sm text-nx-text-faint mt-0.5">{activity.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-nx-text-muted flex-shrink-0">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>

                      {/* Metadata */}
                      {showMetadata && activity.metadata && (
                        <div className="mt-2 p-2 bg-surface-800 rounded text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={key}>
                                <span className="text-nx-text-muted">{key}:</span>{' '}
                                <span className="text-nx-text-muted">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {activity.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-surface-800 text-xs text-nx-text-faint rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-surface-800 border-t border-surface-700 text-sm text-nx-text-faint">
        Showing {filteredActivities.length} of {activities.length} activities
      </div>
    </div>
  );
};

export default ActivityLog;

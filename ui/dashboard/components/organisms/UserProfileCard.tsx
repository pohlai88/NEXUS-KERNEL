/**
 * UserProfileCard Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Phase 12 - Enterprise & Admin Components
 * 
 * Comprehensive user profile display with avatar, stats, activity feed,
 * edit mode, and social links.
 */

'use client';

import React, { useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface UserStat {
  label: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export interface UserActivity {
  id: string;
  type: 'post' | 'comment' | 'like' | 'share' | 'achievement';
  title: string;
  description?: string;
  timestamp: Date;
  icon?: string;
}

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'twitter' | 'website' | 'email';
  url: string;
  label?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: Date;
  role?: string;
  department?: string;
  stats?: UserStat[];
  activities?: UserActivity[];
  socialLinks?: SocialLink[];
  badges?: string[];
  verified?: boolean;
}

export interface UserProfileCardProps {
  profile: UserProfile;
  onEdit?: (profile: UserProfile) => void;
  onFollow?: () => void;
  onMessage?: () => void;
  isFollowing?: boolean;
  isEditable?: boolean;
  showActivities?: boolean;
  showStats?: boolean;
  showSocialLinks?: boolean;
  compact?: boolean;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatActivityTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getSocialIcon = (platform: SocialLink['platform']): string => {
  const icons: Record<SocialLink['platform'], string> = {
    github: '💻',
    linkedin: '💼',
    twitter: '🐦',
    website: '🌐',
    email: '✉️',
  };
  return icons[platform];
};

const getActivityIcon = (type: UserActivity['type']): string => {
  const icons: Record<UserActivity['type'], string> = {
    post: '📝',
    comment: '💬',
    like: '❤️',
    share: '🔄',
    achievement: '🏆',
  };
  return icons[type];
};

// ============================================================================
// Main Component
// ============================================================================

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  onEdit,
  onFollow,
  onMessage,
  isFollowing = false,
  isEditable = false,
  showActivities = true,
  showStats = true,
  showSocialLinks = true,
  compact = false,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity'>('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  // Handlers
  const handleSave = () => {
    if (onEdit) {
      onEdit(editedProfile);
    }
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditMode(false);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`bg-surface-900 border border-surface-700 rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Cover Image */}
      {!compact && (
        <div className="relative h-32 bg-gradient-to-r from-primary-500/20 to-accent-500/20">
          {profile.coverImage && (
            <img
              src={profile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {isEditable && !isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="absolute top-3 right-3 px-3 py-1.5 bg-surface-900/80 backdrop-blur-sm text-xs font-medium text-white rounded-lg hover:bg-surface-800 transition-colors"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>
      )}

      {/* Profile Header */}
      <div className={`px-6 ${compact ? 'pt-6' : '-mt-16'} relative`}>
        <div className="flex items-end justify-between mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className={`${compact ? 'w-16 h-16' : 'w-24 h-24'} rounded-full border-4 border-surface-900 overflow-hidden bg-surface-800`}>
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {profile.verified && (
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-surface-900">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isEditMode && (
            <div className="flex gap-2">
              {onMessage && (
                <button
                  onClick={onMessage}
                  className="px-4 py-2 bg-surface-700 text-white rounded-lg hover:bg-surface-600 transition-colors text-sm font-medium"
                >
                  💬 Message
                </button>
              )}
              {onFollow && (
                <button
                  onClick={onFollow}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isFollowing
                      ? 'bg-surface-700 text-white hover:bg-surface-600'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  {isFollowing ? '✓ Following' : '+ Follow'}
                </button>
              )}
            </div>
          )}

          {/* Edit Mode Buttons */}
          {isEditMode && (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-surface-700 text-white rounded-lg hover:bg-surface-600 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        {isEditMode ? (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={editedProfile.name}
              onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white"
              placeholder="Full Name"
            />
            <input
              type="text"
              value={editedProfile.username}
              onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white"
              placeholder="Username"
            />
            <textarea
              value={editedProfile.bio || ''}
              onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white resize-none"
              placeholder="Bio"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={editedProfile.location || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                className="px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white"
                placeholder="Location"
              />
              <input
                type="text"
                value={editedProfile.website || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                className="px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-white"
                placeholder="Website"
              />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              {profile.badges && profile.badges.length > 0 && (
                <div className="flex gap-1">
                  {profile.badges.slice(0, 3).map((badge, idx) => (
                    <span key={idx} className="text-lg" title={badge}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-2">@{profile.username}</p>
            {profile.bio && <p className="text-sm text-gray-300 mb-3">{profile.bio}</p>}
            <div className="flex flex-wrap gap-3 text-sm text-gray-400">
              {profile.role && (
                <span className="flex items-center gap-1">
                  💼 {profile.role}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1">
                  📍 {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  🔗 {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1">
                📅 Joined {formatDate(profile.joinDate)}
              </span>
            </div>
          </div>
        )}

        {/* Stats */}
        {showStats && profile.stats && profile.stats.length > 0 && !isEditMode && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-surface-700">
            {profile.stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  {stat.trend && (
                    <span
                      className={`text-sm ${
                        stat.trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {stat.trend.direction === 'up' ? '↑' : '↓'} {stat.trend.value}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Social Links */}
        {showSocialLinks && profile.socialLinks && profile.socialLinks.length > 0 && !isEditMode && (
          <div className="flex flex-wrap gap-2 py-4">
            {profile.socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-800 text-gray-300 rounded-lg hover:bg-surface-700 transition-colors text-sm"
              >
                <span>{getSocialIcon(link.platform)}</span>
                <span>{link.label || link.platform}</span>
              </a>
            ))}
          </div>
        )}

        {/* Tabs */}
        {showActivities && profile.activities && profile.activities.length > 0 && !isEditMode && !compact && (
          <div className="border-b border-surface-700 mb-4">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'overview'
                    ? 'text-primary-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Overview
                {activeTab === 'overview' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'activity'
                    ? 'text-primary-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Activity
                {activeTab === 'activity' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'activity' && !isEditMode && profile.activities && (
          <div className="pb-6">
            <div className="space-y-4">
              {profile.activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex gap-3 pb-3 border-b border-surface-800 last:border-0">
                  <span className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium mb-1">{activity.title}</p>
                    {activity.description && (
                      <p className="text-sm text-gray-400 mb-1">{activity.description}</p>
                    )}
                    <p className="text-xs text-gray-500">{formatActivityTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileCard;

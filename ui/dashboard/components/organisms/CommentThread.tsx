/**
 * CommentThread Component
 * Material Design 3 - Quantum Obsidian Design System
 * 
 * Phase 12 - Enterprise & Admin Components
 * 
 * Nested comment system with replies, reactions, mentions,
 * and real-time updates.
 */

'use client';

import React, { useState, useMemo } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ReactionType = 'like' | 'love' | 'celebrate' | 'support' | 'insightful' | 'funny';

export interface CommentReaction {
  type: ReactionType;
  count: number;
  users: string[]; // User IDs who reacted
  userReacted: boolean; // Current user reacted
}

export interface CommentAuthor {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role?: string;
  verified?: boolean;
}

export interface Comment {
  id: string;
  author: CommentAuthor;
  content: string;
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  parentId?: string | null;
  reactions?: CommentReaction[];
  mentions?: string[]; // User IDs mentioned in comment
  attachments?: {
    type: 'image' | 'link' | 'file';
    url: string;
    name?: string;
    thumbnail?: string;
  }[];
  isPinned?: boolean;
  isDeleted?: boolean;
  replyCount?: number;
}

export interface CommentThreadProps {
  comments: Comment[];
  currentUserId: string;
  onCommentAdd?: (content: string, parentId?: string) => void;
  onCommentEdit?: (commentId: string, content: string) => void;
  onCommentDelete?: (commentId: string) => void;
  onReactionToggle?: (commentId: string, reactionType: ReactionType) => void;
  onCommentPin?: (commentId: string) => void;
  allowReplies?: boolean;
  allowReactions?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowMentions?: boolean;
  maxDepth?: number;
  showTimestamps?: boolean;
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

const getReactionIcon = (type: ReactionType): string => {
  const icons: Record<ReactionType, string> = {
    like: '👍',
    love: '❤️',
    celebrate: '🎉',
    support: '🙌',
    insightful: '💡',
    funny: '😄',
  };
  return icons[type];
};

const parseContent = (content: string): React.ReactNode => {
  // Simple mention highlighting - in production, use a proper markdown parser
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('@')) {
      return (
        <span key={idx} className="text-primary-400 hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    return part;
  });
};

// ============================================================================
// Sub-Components
// ============================================================================

const ReactionPicker: React.FC<{
  onSelect: (type: ReactionType) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => {
  const reactions: ReactionType[] = ['like', 'love', 'celebrate', 'support', 'insightful', 'funny'];
  
  return (
    <div className="absolute bottom-full mb-2 left-0 bg-surface-800 border border-surface-600 rounded-lg shadow-xl p-2 flex gap-1 z-10">
      {reactions.map((type) => (
        <button
          key={type}
          onClick={() => {
            onSelect(type);
            onClose();
          }}
          className="p-2 text-2xl hover:bg-surface-700 rounded transition-colors"
          title={type}
        >
          {getReactionIcon(type)}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// Comment Item Component
// ============================================================================

const CommentItem: React.FC<{
  comment: Comment;
  replies: Comment[];
  depth: number;
  currentUserId: string;
  maxDepth: number;
  showTimestamps: boolean;
  allowReplies: boolean;
  allowReactions: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  onReply?: (parentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReactionToggle?: (commentId: string, reactionType: ReactionType) => void;
  onPin?: (commentId: string) => void;
}> = ({
  comment,
  replies,
  depth,
  currentUserId,
  maxDepth,
  showTimestamps,
  allowReplies,
  allowReactions,
  allowEdit,
  allowDelete,
  onReply,
  onEdit,
  onDelete,
  onReactionToggle,
  onPin,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const isAuthor = comment.author.id === currentUserId;
  const canReply = allowReplies && depth < maxDepth;

  const handleReplySubmit = () => {
    if (replyContent.trim() && onReply) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  if (comment.isDeleted) {
    return (
      <div className="text-sm text-gray-500 italic py-2">
        [Comment deleted]
      </div>
    );
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-surface-700 pl-4' : ''}`}>
      <div className="py-3">
        {/* Comment Header */}
        <div className="flex gap-3 mb-2">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center text-lg font-bold text-gray-400">
                {comment.author.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author & Timestamp */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">{comment.author.name}</span>
              {comment.author.verified && (
                <span className="text-primary-400" title="Verified">✓</span>
              )}
              {comment.author.role && (
                <span className="px-2 py-0.5 bg-surface-700 text-xs text-gray-400 rounded">
                  {comment.author.role}
                </span>
              )}
              {comment.isPinned && (
                <span className="text-yellow-400" title="Pinned">📌</span>
              )}
              {showTimestamps && (
                <span className="text-sm text-gray-500">
                  {formatTimestamp(comment.timestamp)}
                  {comment.edited && ' (edited)'}
                </span>
              )}
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <div className="mb-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-sm text-white resize-none focus:outline-none focus:border-primary-500"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleEditSubmit}
                    className="px-3 py-1.5 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditContent(comment.content);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1.5 bg-surface-700 text-white rounded text-sm hover:bg-surface-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-300 mb-2">
                {parseContent(comment.content)}
              </p>
            )}

            {/* Attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {comment.attachments.map((attachment, idx) => (
                  <div key={idx} className="bg-surface-800 rounded-lg p-2 text-sm">
                    {attachment.type === 'image' && attachment.thumbnail ? (
                      <img
                        src={attachment.thumbnail}
                        alt={attachment.name}
                        className="max-w-xs rounded"
                      />
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:underline flex items-center gap-1"
                      >
                        📎 {attachment.name || 'Attachment'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reactions */}
            {comment.reactions && comment.reactions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {comment.reactions.map((reaction) => (
                  <button
                    key={reaction.type}
                    onClick={() => onReactionToggle?.(comment.id, reaction.type)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
                      reaction.userReacted
                        ? 'bg-primary-500/20 border border-primary-500 text-primary-400'
                        : 'bg-surface-800 hover:bg-surface-700 text-gray-400'
                    }`}
                    title={reaction.users.join(', ')}
                  >
                    <span>{getReactionIcon(reaction.type)}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {/* React */}
              {allowReactions && (
                <div className="relative">
                  <button
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    className="hover:text-primary-400 transition-colors"
                  >
                    😊 React
                  </button>
                  {showReactionPicker && (
                    <ReactionPicker
                      onSelect={(type) => onReactionToggle?.(comment.id, type)}
                      onClose={() => setShowReactionPicker(false)}
                    />
                  )}
                </div>
              )}

              {/* Reply */}
              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="hover:text-primary-400 transition-colors"
                >
                  💬 Reply
                </button>
              )}

              {/* Show Replies */}
              {replies.length > 0 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="hover:text-primary-400 transition-colors"
                >
                  {showReplies ? '−' : '+'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}

              {/* Edit (author only) */}
              {allowEdit && isAuthor && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="hover:text-primary-400 transition-colors"
                >
                  ✏️ Edit
                </button>
              )}

              {/* Delete (author only) */}
              {allowDelete && isAuthor && (
                <button
                  onClick={() => onDelete?.(comment.id)}
                  className="hover:text-red-400 transition-colors"
                >
                  🗑️ Delete
                </button>
              )}

              {/* Pin (moderator action) */}
              {onPin && (
                <button
                  onClick={() => onPin(comment.id)}
                  className="hover:text-yellow-400 transition-colors"
                >
                  📌 {comment.isPinned ? 'Unpin' : 'Pin'}
                </button>
              )}
            </div>

            {/* Reply Input */}
            {isReplying && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-primary-500"
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleReplySubmit}
                    className="px-3 py-1.5 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyContent('');
                      setIsReplying(false);
                    }}
                    className="px-3 py-1.5 bg-surface-700 text-white rounded text-sm hover:bg-surface-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]} // Will be populated by parent
                depth={depth + 1}
                currentUserId={currentUserId}
                maxDepth={maxDepth}
                showTimestamps={showTimestamps}
                allowReplies={allowReplies}
                allowReactions={allowReactions}
                allowEdit={allowEdit}
                allowDelete={allowDelete}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReactionToggle={onReactionToggle}
                onPin={onPin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  currentUserId,
  onCommentAdd,
  onCommentEdit,
  onCommentDelete,
  onReactionToggle,
  onCommentPin,
  allowReplies = true,
  allowReactions = true,
  allowEdit = true,
  allowDelete = true,
  allowMentions = true,
  maxDepth = 5,
  showTimestamps = true,
  className = '',
}) => {
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  // Build comment tree
  const commentTree = useMemo(() => {
    const buildTree = (parentId: string | null | undefined): Comment[] => {
      return comments
        .filter(c => c.parentId === parentId)
        .map(c => ({
          ...c,
          replies: buildTree(c.id),
        }));
    };
    return buildTree(null);
  }, [comments]);

  // Sort comments
  const sortedComments = useMemo(() => {
    const sorted = [...commentTree];
    
    // Pinned comments always first
    sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      switch (sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'popular':
          const aReactions = a.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;
          const bReactions = b.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;
          return bReactions - aReactions;
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [commentTree, sortBy]);

  // Get replies for a comment
  const getReplies = (commentId: string): Comment[] => {
    return comments.filter(c => c.parentId === commentId);
  };

  const handleSubmit = () => {
    if (newComment.trim() && onCommentAdd) {
      onCommentAdd(newComment.trim());
      setNewComment('');
    }
  };

  const handleReply = (parentId: string, content: string) => {
    if (onCommentAdd) {
      onCommentAdd(content, parentId);
    }
  };

  const totalComments = comments.filter(c => !c.isDeleted).length;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`bg-surface-900 border border-surface-700 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">
            Comments ({totalComments})
          </h3>
          
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 bg-surface-800 border border-surface-600 rounded text-sm text-white focus:outline-none focus:border-primary-500"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="popular">Most popular</option>
          </select>
        </div>

        {/* New Comment Input */}
        {onCommentAdd && (
          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-primary-500"
              rows={3}
            />
            {allowMentions && (
              <p className="text-xs text-gray-500 mt-1">
                Use @username to mention someone
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Post Comment
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="max-h-[600px] overflow-y-auto">
        {sortedComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-400">No comments yet</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to comment!</p>
          </div>
        ) : (
          <div className="px-4 divide-y divide-surface-700">
            {sortedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={getReplies(comment.id)}
                depth={0}
                currentUserId={currentUserId}
                maxDepth={maxDepth}
                showTimestamps={showTimestamps}
                allowReplies={allowReplies}
                allowReactions={allowReactions}
                allowEdit={allowEdit}
                allowDelete={allowDelete}
                onReply={handleReply}
                onEdit={onCommentEdit}
                onDelete={onCommentDelete}
                onReactionToggle={onReactionToggle}
                onPin={onCommentPin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentThread;

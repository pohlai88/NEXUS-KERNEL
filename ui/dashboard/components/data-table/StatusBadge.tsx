/**
 * StatusBadge - User status and payment status badges
 * Based on Figma design: nodes 423:4410, 121:33, 428:3731
 * Colors: Active (blue), Inactive (gray), Paid (green), Unpaid (orange), Overdue (red)
 */

import type { UserStatus, PaymentStatus } from './types';

interface StatusBadgeProps {
  type: 'user' | 'payment';
  status: UserStatus | PaymentStatus;
}

const USER_STATUS_STYLES: Record<UserStatus, { bg: string; text: string; dot: string }> = {
  Active: {
    bg: '#EEF2FF',
    text: '#4F46E5',
    dot: '#4F46E5',
  },
  Inactive: {
    bg: '#F3F4F6',
    text: '#6B7280',
    dot: '#9CA3AF',
  },
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, { bg: string; text: string; dot: string }> = {
  Paid: {
    bg: '#ECFDF5',
    text: '#059669',
    dot: '#10B981',
  },
  Unpaid: {
    bg: '#FEF3C7',
    text: '#D97706',
    dot: '#F59E0B',
  },
  Overdue: {
    bg: '#FEE2E2',
    text: '#DC2626',
    dot: '#EF4444',
  },
};

export function StatusBadge({ type, status }: StatusBadgeProps) {
  const styles = type === 'user' 
    ? USER_STATUS_STYLES[status as UserStatus]
    : PAYMENT_STATUS_STYLES[status as PaymentStatus];

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-caption font-medium"
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: styles.dot }}
      />
      {status}
    </div>
  );
}

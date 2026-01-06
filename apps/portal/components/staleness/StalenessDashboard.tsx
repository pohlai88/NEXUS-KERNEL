/**
 * Staleness Dashboard
 * 
 * PRD S-03: Silence Is a Bug
 * - Shows invoices with no updates and no system messages
 * - Automatic notifications sent
 */

'use client';

import { useState, useEffect } from 'react';
import { getStalenessAction, getStalenessSummaryAction, detectStalenessAction } from '@/app/staleness/actions';

interface InvoiceStaleness {
  id: string;
  invoice_id: string;
  status: string;
  days_since_last_update: number;
  staleness_level: 'warning' | 'critical' | 'severe';
  expected_action: string | null;
  notification_sent: boolean;
  detected_at: string;
}

interface StalenessSummary {
  total: number;
  warning: number;
  critical: number;
  severe: number;
  notifications_sent: number;
  notifications_pending: number;
}

export function StalenessDashboard() {
  const [staleness, setStaleness] = useState<InvoiceStaleness[]>([]);
  const [summary, setSummary] = useState<StalenessSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stalenessResult, summaryResult] = await Promise.all([
        getStalenessAction({ notification_sent: false }), // Show unresolved staleness
        getStalenessSummaryAction(),
      ]);

      if (stalenessResult.success) {
        setStaleness(stalenessResult.staleness || []);
      }
      if (summaryResult.success) {
        setSummary(summaryResult.summary);
      }
    } catch (error) {
      console.error('Failed to load staleness:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetect = async () => {
    setIsDetecting(true);
    try {
      const result = await detectStalenessAction();
      if (result.success) {
        await loadData(); // Reload after detection
      }
    } catch (error) {
      console.error('Failed to detect staleness:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const getStalenessIcon = (level: string) => {
    switch (level) {
      case 'severe':
        return '🔴';
      case 'critical':
        return '🟠';
      case 'warning':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const getStalenessColor = (level: string) => {
    switch (level) {
      case 'severe':
        return 'bg-nx-danger-bg text-nx-danger';
      case 'critical':
        return 'bg-nx-warning-bg text-nx-warning';
      case 'warning':
        return 'bg-nx-info-bg text-nx-info';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <p className="caption">Loading staleness data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Staleness Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDetect}
            disabled={isDetecting}
            className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary"
          >
            {isDetecting ? 'Detecting...' : '🔍 Detect Staleness'}
          </button>
          <button onClick={loadData} className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="caption">Total Stale</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{summary.total}</div>
          </div>
          <div className="card p-4 bg-nx-danger-bg">
            <div className="caption">🔴 Severe</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{summary.severe}</div>
          </div>
          <div className="card p-4 bg-nx-warning-bg">
            <div className="caption">🟠 Critical</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{summary.critical}</div>
          </div>
          <div className="card p-4 bg-nx-info-bg">
            <div className="caption">🟡 Warning</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{summary.warning}</div>
          </div>
        </div>
      )}

      {/* Staleness List */}
      <div className="space-y-4">
        {staleness.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-base font-semibold text-nx-text-main">No Stale Invoices</p>
            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-2">All invoices have recent activity!</p>
          </div>
        ) : (
          staleness.map((item) => (
            <div
              key={item.id}
              className={`card p-4 border-l-4 ${getStalenessColor(item.staleness_level)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStalenessIcon(item.staleness_level)}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-nx-text-main">
                      Invoice Stale - {item.staleness_level.toUpperCase()}
                    </h3>
                    <p className="caption text-sm">
                      {item.days_since_last_update} days without update
                    </p>
                  </div>
                </div>
                <span className={`badge badge-${item.status === 'PAID' ? 'badge-success' : 'pending'}`}>
                  {item.status}
                </span>
              </div>
              
              {item.expected_action && (
                <div className="card p-3 bg-nx-surface mt-2">
                  <p className="caption font-semibold mb-1">Expected Action:</p>
                  <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-sm">{item.expected_action}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <p className="caption text-sm">
                  Detected: {new Date(item.detected_at).toLocaleString()}
                  {item.notification_sent && ' • Notification sent'}
                </p>
                <a
                  href={`/invoices/${item.invoice_id}`}
                  className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main text-sm"
                >
                  View Invoice →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


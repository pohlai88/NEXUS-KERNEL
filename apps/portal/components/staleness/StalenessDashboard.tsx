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
import type { InvoiceStaleness as ServiceInvoiceStaleness } from '@/src/services/staleness-detection-service';

// Extend service type with detected_at for UI
interface InvoiceStaleness extends Partial<ServiceInvoiceStaleness> {
  id: string;
  invoice_id: string;
  status: string;
  days_since_last_update: number;
  staleness_level: 'warning' | 'critical' | 'severe';
  expected_action: string | null;
  notification_sent: boolean;
  detected_at?: string;
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
        return 'na-bg-danger-subtle na-text-danger';
      case 'critical':
        return 'na-bg-warn-subtle na-text-warn';
      case 'warning':
        return 'na-bg-info-subtle na-text-info';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="na-card na-p-6">
        <p className="na-metadata">Loading staleness data...</p>
      </div>
    );
  }

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Staleness Dashboard</h1>
        <div className="na-flex na-gap-2">
          <button
            onClick={handleDetect}
            disabled={isDetecting}
            className="na-btn na-btn-primary"
          >
            {isDetecting ? 'Detecting...' : '🔍 Detect Staleness'}
          </button>
          <button onClick={loadData} className="na-btn na-btn-ghost">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="na-grid na-grid-cols-4 na-gap-4 na-mb-6">
          <div className="na-card na-p-4">
            <div className="na-metadata">Total Stale</div>
            <div className="na-data-large">{summary.total}</div>
          </div>
          <div className="na-card na-p-4 na-bg-danger-subtle">
            <div className="na-metadata">🔴 Severe</div>
            <div className="na-data-large">{summary.severe}</div>
          </div>
          <div className="na-card na-p-4 na-bg-warn-subtle">
            <div className="na-metadata">🟠 Critical</div>
            <div className="na-data-large">{summary.critical}</div>
          </div>
          <div className="na-card na-p-4 na-bg-info-subtle">
            <div className="na-metadata">🟡 Warning</div>
            <div className="na-data-large">{summary.warning}</div>
          </div>
        </div>
      )}

      {/* Staleness List */}
      <div className="na-space-y-4">
        {staleness.length === 0 ? (
          <div className="na-card na-p-6 na-text-center">
            <p className="na-h4">No Stale Invoices</p>
            <p className="na-body na-mt-2">All invoices have recent activity!</p>
          </div>
        ) : (
          staleness.map((item) => (
            <div
              key={item.id}
              className={`na-card na-p-4 na-border-l-4 ${getStalenessColor(item.staleness_level)}`}
            >
              <div className="na-flex na-items-start na-justify-between na-mb-2">
                <div className="na-flex na-items-center na-gap-2">
                  <span className="na-text-2xl">{getStalenessIcon(item.staleness_level)}</span>
                  <div>
                    <h3 className="na-h5">
                      Invoice Stale - {item.staleness_level.toUpperCase()}
                    </h3>
                    <p className="na-metadata na-text-sm">
                      {item.days_since_last_update} days without update
                    </p>
                  </div>
                </div>
                <span className={`na-status na-status-${item.status === 'PAID' ? 'ok' : 'pending'}`}>
                  {item.status}
                </span>
              </div>

              {item.expected_action && (
                <div className="na-card na-p-3 na-bg-paper na-mt-2">
                  <p className="na-metadata na-font-semibold na-mb-1">Expected Action:</p>
                  <p className="na-body na-text-sm">{item.expected_action}</p>
                </div>
              )}

              <div className="na-flex na-items-center na-justify-between na-mt-3">
                <p className="na-metadata na-text-sm">
                  {item.detected_at ? `Detected: ${new Date(item.detected_at).toLocaleString()}` : 'Recently detected'}
                  {item.notification_sent && ' • Notification sent'}
                </p>
                <a
                  href={`/invoices/${item.invoice_id}`}
                  className="na-btn na-btn-ghost na-text-sm"
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


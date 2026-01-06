/**
 * Exception-First Dashboard
 * 
 * PRD A-01: Exception-First Workload
 * - Shows only problems, not volume
 * - Severity tagging: 🔴 Blocking, 🟠 Needs action, 🟢 Safe
 */

'use client';

import { useState, useEffect } from 'react';
import { getExceptionsAction, getExceptionSummaryAction } from '@/app/exceptions/actions';

interface Exception {
  id: string;
  invoice_id: string;
  exception_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'ignored';
  title: string;
  description: string;
  detected_at: string;
}

interface ExceptionSummary {
  total: number;
  blocking: number;
  needs_action: number;
  safe: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

export function ExceptionDashboard() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [summary, setSummary] = useState<ExceptionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'critical' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [exceptionsResult, summaryResult] = await Promise.all([
        getExceptionsAction(filter === 'all' ? undefined : { 
          status: filter === 'open' ? 'open' : undefined,
          severity: filter !== 'all' && filter !== 'open' ? filter as any : undefined,
        }),
        getExceptionSummaryAction(),
      ]);

      if (exceptionsResult.success) {
        setExceptions(exceptionsResult.exceptions || []);
      }
      if (summaryResult.success) {
        setSummary(summaryResult.summary);
      }
    } catch (error) {
      console.error('Failed to load exceptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return '🔴';
      case 'medium':
        return '🟠';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'Blocking';
      case 'medium':
        return 'Needs Action';
      case 'low':
        return 'Safe';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <p className="caption">Loading exceptions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Exception Dashboard</h1>
        <button onClick={loadData} className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <div className="caption">Total Exceptions</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{summary.total}</div>
          </div>
          <div className="card p-4 bg-nx-danger-bg">
            <div className="caption">🔴 Blocking</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{summary.blocking}</div>
          </div>
          <div className="card p-4 bg-nx-warning-bg">
            <div className="caption">🟠 Needs Action</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{summary.needs_action}</div>
          </div>
          <div className="card p-4 bg-nx-success-bg">
            <div className="caption">🟢 Safe</div>
            <div className="text-[length:var(--nx-display-size)] font-bold text-nx-text-main">{summary.safe}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${filter === 'all' ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${filter === 'open' ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            Open Only
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${filter === 'critical' ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            🔴 Critical
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${filter === 'high' ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            🔴 High
          </button>
          <button
            onClick={() => setFilter('medium')}
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${filter === 'medium' ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            🟠 Medium
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer ${filter === 'low' ? 'btn-primary' : 'bg-transparent hover:bg-nx-ghost-hover text-nx-text-main'}`}
          >
            🟢 Low
          </button>
        </div>
      </div>

      {/* Exceptions List */}
      <div className="space-y-4">
        {exceptions.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-base font-semibold text-nx-text-main">No Exceptions Found</p>
            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-2">All invoices are in good standing!</p>
          </div>
        ) : (
          exceptions.map((exception) => (
            <div
              key={exception.id}
              className="card p-4 border-l-4"
              style={{
                borderLeftColor: exception.severity === 'critical' || exception.severity === 'high' 
                  ? 'var(--color-danger)' 
                  : exception.severity === 'medium' 
                    ? 'var(--color-warn)' 
                    : 'var(--color-ok)',
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getSeverityIcon(exception.severity)}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-nx-text-main">{exception.title}</h3>
                    <p className="caption text-sm">
                      {getSeverityLabel(exception.severity)} • {exception.exception_type}
                    </p>
                  </div>
                </div>
                <span className={`badge badge-${'open' === status ? 'info' : exception.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                  {exception.status}
                </span>
              </div>
              <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mb-2">{exception.description}</p>
              <div className="flex items-center justify-between">
                <p className="caption text-sm">
                  Detected: {new Date(exception.detected_at).toLocaleString()}
                </p>
                <a
                  href={`/invoices/${exception.invoice_id}`}
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


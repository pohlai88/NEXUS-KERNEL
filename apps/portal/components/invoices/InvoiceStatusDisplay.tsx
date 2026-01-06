/**
 * Invoice Status Display Component
 * 
 * PRD V-01: Payment Status Transparency
 * - Shows current status, reason code, last updated time
 * - Expected next step and payment date
 */

'use client';

import { useState } from 'react';
import { getInvoiceStatusInfoAction } from '@/app/invoices/status/actions';

interface InvoiceStatusTimelineEntry {
    id: string;
    invoice_id: string;
    status: string;
    reason_code: string;
    reason_text: string | null;
    changed_at: string;
    changed_by: string | null;
    expected_next_step: string | null;
    notes: string | null;
    created_at: string;
}

interface InvoiceStatusInfo {
    current_status: string;
    current_status_reason_code: string;
    current_status_reason_text: string | null;
    status_changed_at: string | null;
    status_changed_by?: string | null;
    expected_next_step: string | null;
    expected_payment_date: string | null;
    timeline?: InvoiceStatusTimelineEntry[];
}

interface InvoiceStatusDisplayProps {
    invoiceId: string;
    initialStatus?: InvoiceStatusInfo;
}

export function InvoiceStatusDisplay({ invoiceId, initialStatus }: InvoiceStatusDisplayProps) {
    const [statusInfo, setStatusInfo] = useState(initialStatus);
    const [showTimeline, setShowTimeline] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            const result = await getInvoiceStatusInfoAction(invoiceId);
            if (result.success && result.status_info) {
                setStatusInfo(result.status_info);
            }
        } catch (error) {
            console.error('Failed to refresh status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!statusInfo) {
        return (
            <div className="card p-4">
                <p className="caption">Loading status...</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'badge-success';
            case 'APPROVED_FOR_PAYMENT':
                return 'badge-success';
            case 'REJECTED':
                return 'badge-danger';
            case 'UNDER_REVIEW':
                return 'badge-warning';
            case 'RECEIVED':
                return 'badge-info';
            default:
                return 'badge-info';
        }
    };

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="section">Invoice Status</h3>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main text-sm"
                >
                    {isLoading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
            </div>

            {/* Current Status */}
            <div className="space-y-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`badge ${getStatusColor(statusInfo.current_status)}`}>
                            {statusInfo.current_status}
                        </span>
                        <span className="caption">
                            {statusInfo.current_status_reason_text || statusInfo.current_status_reason_code}
                        </span>
                    </div>
                    {statusInfo.status_changed_at && (
                        <p className="caption text-sm">
                            Last updated: {new Date(statusInfo.status_changed_at).toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Expected Next Step */}
                {statusInfo.expected_next_step && (
                    <div className="card p-4 bg-nx-info-bg">
                        <p className="caption font-semibold mb-1">Expected Next Step:</p>
                        <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{statusInfo.expected_next_step}</p>
                    </div>
                )}

                {/* Expected Payment Date */}
                {statusInfo.expected_payment_date && (
                    <div className="card p-4 bg-nx-success-bg">
                        <p className="caption font-semibold mb-1">Expected Payment Date:</p>
                        <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
                            {new Date(statusInfo.expected_payment_date).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {/* Timeline Toggle */}
                <button
                    onClick={() => setShowTimeline(!showTimeline)}
                    className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main w-full text-sm"
                >
                    {showTimeline ? '▼' : '▶'} Status Timeline
                </button>

                {/* Timeline */}
                {showTimeline && statusInfo.timeline && statusInfo.timeline.length > 0 && (
                    <div className="space-y-2 mt-4">
                        {statusInfo.timeline.map((entry: InvoiceStatusTimelineEntry) => (
                            <div key={entry.id} className="card p-3 border-l-4 border-l-nx-primary">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`badge ${getStatusColor(entry.status)}`}>
                                        {entry.status}
                                    </span>
                                    <span className="caption text-sm">
                                        {new Date(entry.changed_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="caption text-sm">{entry.reason_text || entry.reason_code}</p>
                                {entry.expected_next_step && (
                                    <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main text-sm mt-1">{entry.expected_next_step}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


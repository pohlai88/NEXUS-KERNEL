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
            <div className="na-card na-p-4">
                <p className="na-metadata">Loading status...</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'na-status-ok';
            case 'APPROVED_FOR_PAYMENT':
                return 'na-status-ok';
            case 'REJECTED':
                return 'na-status-bad';
            case 'UNDER_REVIEW':
                return 'na-status-warn';
            case 'RECEIVED':
                return 'na-status-pending';
            default:
                return 'na-status-pending';
        }
    };

    return (
        <div className="na-card na-p-6">
            <div className="na-flex na-items-center na-justify-between na-mb-4">
                <h3 className="na-h3">Invoice Status</h3>
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="na-btn na-btn-ghost na-text-sm"
                >
                    {isLoading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
            </div>

            {/* Current Status */}
            <div className="na-space-y-4">
                <div>
                    <div className="na-flex na-items-center na-gap-3 na-mb-2">
                        <span className={`na-status ${getStatusColor(statusInfo.current_status)}`}>
                            {statusInfo.current_status}
                        </span>
                        <span className="na-metadata">
                            {statusInfo.current_status_reason_text || statusInfo.current_status_reason_code}
                        </span>
                    </div>
                    {statusInfo.status_changed_at && (
                        <p className="na-metadata na-text-sm">
                            Last updated: {new Date(statusInfo.status_changed_at).toLocaleString()}
                        </p>
                    )}
                </div>

                {/* Expected Next Step */}
                {statusInfo.expected_next_step && (
                    <div className="na-card na-p-4 na-bg-info-subtle">
                        <p className="na-metadata na-font-semibold na-mb-1">Expected Next Step:</p>
                        <p className="na-body">{statusInfo.expected_next_step}</p>
                    </div>
                )}

                {/* Expected Payment Date */}
                {statusInfo.expected_payment_date && (
                    <div className="na-card na-p-4 na-bg-ok-subtle">
                        <p className="na-metadata na-font-semibold na-mb-1">Expected Payment Date:</p>
                        <p className="na-body">
                            {new Date(statusInfo.expected_payment_date).toLocaleDateString()}
                        </p>
                    </div>
                )}

                {/* Timeline Toggle */}
                <button
                    onClick={() => setShowTimeline(!showTimeline)}
                    className="na-btn na-btn-ghost na-w-full na-text-sm"
                >
                    {showTimeline ? '▼' : '▶'} Status Timeline
                </button>

                {/* Timeline */}
                {showTimeline && statusInfo.timeline && statusInfo.timeline.length > 0 && (
                    <div className="na-space-y-2 na-mt-4">
                        {statusInfo.timeline.map((entry: InvoiceStatusTimelineEntry) => (
                            <div key={entry.id} className="na-card na-p-3 na-border-l-4 na-border-l-primary">
                                <div className="na-flex na-items-center na-justify-between na-mb-1">
                                    <span className={`na-status ${getStatusColor(entry.status)}`}>
                                        {entry.status}
                                    </span>
                                    <span className="na-metadata na-text-sm">
                                        {new Date(entry.changed_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="na-metadata na-text-sm">{entry.reason_text || entry.reason_code}</p>
                                {entry.expected_next_step && (
                                    <p className="na-body na-text-sm na-mt-1">{entry.expected_next_step}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


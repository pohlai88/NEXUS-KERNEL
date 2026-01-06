/**
 * Invoice Rejection Form with Enforced Reason Codes
 * 
 * PRD A-03: System-Enforced Rejection
 * - Standardized rejection reasons (select, not type)
 * - No free-text rejection reasons
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import { rejectInvoiceAction, getRejectionReasonCodesAction } from '@/app/invoices/reject/actions';

interface RejectionReasonCode {
  id: string;
  reason_code: string;
  reason_label: string;
  reason_description: string | null;
  category: string;
  requires_explanation: boolean;
}

interface InvoiceRejectionFormProps {
  invoiceId: string;
  onRejected?: () => void;
  onCancel?: () => void;
}

export function InvoiceRejectionForm({ invoiceId, onRejected, onCancel }: InvoiceRejectionFormProps) {
  const [reasonCodes, setReasonCodes] = useState<RejectionReasonCode[]>([]);
  const [selectedReasonCode, setSelectedReasonCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReasonCodes();
  }, []);

  const loadReasonCodes = async () => {
    setIsLoading(true);
    try {
      const result = await getRejectionReasonCodesAction();
      if (result.success && result.reason_codes) {
        setReasonCodes(result.reason_codes);
      }
    } catch (error) {
      console.error('Failed to load reason codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedReason = reasonCodes.find((r) => r.reason_code === selectedReasonCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedReasonCode) {
      setError('Please select a rejection reason');
      return;
    }

    if (selectedReason?.requires_explanation && !explanation.trim()) {
      setError('Explanation is required for this rejection reason');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('reason_code', selectedReasonCode);
      if (explanation) {
        formData.append('explanation', explanation);
      }
      if (notes) {
        formData.append('notes', notes);
      }

      const result = await rejectInvoiceAction(invoiceId, formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        onRejected?.();
      }
    });
  };

  const groupedReasons = reasonCodes.reduce((acc, reason) => {
    if (!acc[reason.category]) {
      acc[reason.category] = [];
    }
    acc[reason.category].push(reason);
    return acc;
  }, {} as Record<string, RejectionReasonCode[]>);

  if (isLoading) {
    return (
      <div className="card p-6">
        <p className="caption">Loading rejection reasons...</p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main mb-4">Reject Invoice</h2>

      {error && (
        <div className="card p-4 bg-nx-danger-bg text-nx-danger mb-4">
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rejection Reason Code Selection */}
        <div>
          <label className="caption mb-2 block">Rejection Reason *</label>
          <select
            value={selectedReasonCode}
            onChange={(e) => setSelectedReasonCode(e.target.value)}
            className="input w-full"
            required
          >
            <option value="">Select a reason...</option>
            {Object.entries(groupedReasons).map(([category, reasons]) => (
              <optgroup key={category} label={category}>
                {reasons.map((reason) => (
                  <option key={reason.id} value={reason.reason_code}>
                    {reason.reason_label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {selectedReason && selectedReason.reason_description && (
            <p className="caption text-sm mt-1">
              {selectedReason.reason_description}
            </p>
          )}
        </div>

        {/* Explanation (if required) */}
        {selectedReason?.requires_explanation && (
          <div>
            <label className="caption mb-2 block">
              Explanation * (Required for this reason)
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="input w-full"
              rows={4}
              placeholder="Please provide an explanation for this rejection..."
              required
            />
          </div>
        )}

        {/* Optional Notes */}
        <div>
          <label className="caption mb-2 block">Additional Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input w-full"
            rows={3}
            placeholder="Any additional notes..."
          />
        </div>

        {/* Warning */}
        <div className="card p-4 bg-nx-warning-bg">
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main font-semibold">⚠️ Important</p>
          <p className="caption text-sm mt-1">
            The vendor will see the exact same rejection reason you select. 
            This rejection will be recorded in the audit trail.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-nx-danger text-white hover:bg-nx-danger-text flex-1"
          >
            {isPending ? 'Rejecting...' : 'Reject Invoice'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}


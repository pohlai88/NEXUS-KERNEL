/**
 * Break Glass Button Component
 * 
 * SOS feature: Vendor can escalate directly to Senior Manager.
 * "I cannot find anyone" → Break Glass → Senior Manager notified.
 */

'use client';

import { useState, useTransition } from 'react';
import { createBreakGlassEscalationAction } from '@/app/escalations/break-glass/actions';

interface BreakGlassButtonProps {
  caseId?: string;
  invoiceId?: string;
  vendorId: string;
  onEscalated?: () => void;
}

export function BreakGlassButton({ caseId, invoiceId, vendorId, onEscalated }: BreakGlassButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [escalationType, setEscalationType] = useState<'sla_breach' | 'no_response' | 'staff_difficulty' | 'urgent_issue' | 'other'>('no_response');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!reason || !description) {
      setError('Reason and description are required');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('escalation_type', escalationType);
      formData.append('priority', 'critical');
      if (caseId) formData.append('case_id', caseId);
      if (invoiceId) formData.append('invoice_id', invoiceId);
      formData.append('vendor_id', vendorId);
      formData.append('reason', reason);
      formData.append('description', description);

      const result = await createBreakGlassEscalationAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        setReason('');
        setDescription('');
        setError(null);
        onEscalated?.();
      }
    });
  };

  return (
    <>
      <button
        className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-nx-danger text-white hover:bg-nx-danger-text flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <span>🚨</span>
        <span>BREAK GLASS</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-2xl w-full mx-4">
            <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main mb-4">🚨 Break Glass Escalation (SOS)</h2>
            <p className="caption mb-6">
              Escalate directly to Senior Manager when you cannot find anyone or are being ignored.
            </p>

            <div className="space-y-4">
              <div>
                <label className="caption mb-2 block">Escalation Type *</label>
                <select
                  value={escalationType}
                  onChange={(e) => setEscalationType(e.target.value as BreakGlassButtonProps['escalationType'])}
                  className="input w-full"
                >
                  <option value="no_response">No Response</option>
                  <option value="sla_breach">SLA Breach</option>
                  <option value="staff_difficulty">Staff Making Life Difficult</option>
                  <option value="urgent_issue">Urgent Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="caption mb-2 block">Reason *</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input w-full"
                  placeholder="Brief reason for escalation"
                  required
                />
              </div>

              <div>
                <label className="caption mb-2 block">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input w-full"
                  rows={5}
                  placeholder="Detailed description of the issue..."
                  required
                />
              </div>

              {error && (
                <div className="card p-4 bg-nx-danger-bg text-nx-danger">
                  <p className="caption">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary flex-1"
                  onClick={() => {
                    setIsOpen(false);
                    setError(null);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-nx-danger text-white hover:bg-nx-danger-text flex-1"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  {isPending ? 'Escalating...' : '🚨 BREAK GLASS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


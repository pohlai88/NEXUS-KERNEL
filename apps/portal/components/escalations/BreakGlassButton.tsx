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
  escalationType?: 'sla_breach' | 'no_response' | 'staff_difficulty' | 'urgent_issue' | 'other';
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
        className="na-btn na-btn-danger na-flex na-items-center na-gap-2"
        onClick={() => setIsOpen(true)}
      >
        <span>🚨</span>
        <span>BREAK GLASS</span>
      </button>

      {isOpen && (
        <div className="na-fixed na-inset-0 na-bg-black na-bg-opacity-50 na-flex na-items-center na-justify-center na-z-50">
          <div className="na-card na-p-6 na-max-w-2xl na-w-full na-mx-4">
            <h2 className="na-h2 na-mb-4">🚨 Break Glass Escalation (SOS)</h2>
            <p className="na-metadata na-mb-6">
              Escalate directly to Senior Manager when you cannot find anyone or are being ignored.
            </p>

            <div className="na-space-y-4">
              <div>
                <label className="na-metadata na-mb-2 na-block">Escalation Type *</label>
                <select
                  value={escalationType}
                  onChange={(e) => setEscalationType(e.target.value as 'sla_breach' | 'no_response' | 'staff_difficulty' | 'urgent_issue' | 'other')}
                  className="na-input na-w-full"
                >
                  <option value="no_response">No Response</option>
                  <option value="sla_breach">SLA Breach</option>
                  <option value="staff_difficulty">Staff Making Life Difficult</option>
                  <option value="urgent_issue">Urgent Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="na-metadata na-mb-2 na-block">Reason *</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="na-input na-w-full"
                  placeholder="Brief reason for escalation"
                  required
                />
              </div>

              <div>
                <label className="na-metadata na-mb-2 na-block">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="na-input na-w-full"
                  rows={5}
                  placeholder="Detailed description of the issue..."
                  required
                />
              </div>

              {error && (
                <div className="na-card na-p-4 na-bg-danger-subtle na-text-danger">
                  <p className="na-metadata">{error}</p>
                </div>
              )}

              <div className="na-flex na-gap-4">
                <button
                  className="na-btn na-btn-secondary na-flex-1"
                  onClick={() => {
                    setIsOpen(false);
                    setError(null);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  className="na-btn na-btn-danger na-flex-1"
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


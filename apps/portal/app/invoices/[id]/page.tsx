/**
 * Invoice Detail Page
 * 
 * Shows invoice details with status display, timeline, and rejection form
 */

import { Suspense } from 'react';
import { InvoiceStatusDisplay } from '@/components/invoices/InvoiceStatusDisplay';
import { InvoiceRejectionForm } from '@/components/invoices/InvoiceRejectionForm';
import { getInvoiceStatusInfoAction } from '@/app/invoices/status/actions';

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const statusInfo = await getInvoiceStatusInfoAction(params.id);

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Invoice #{params.id.slice(0, 8)}</h1>
        <a href="/invoices" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          ← Back to Invoices
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Display */}
        <div>
          <Suspense fallback={<div className="card p-6">Loading status...</div>}>
            <InvoiceStatusDisplay
              invoiceId={params.id}
              initialStatus={statusInfo.success ? statusInfo.status_info : undefined}
            />
          </Suspense>
        </div>

        {/* Rejection Form (if not already rejected/paid) */}
        {statusInfo.success && 
         statusInfo.status_info?.current_status !== 'REJECTED' && 
         statusInfo.status_info?.current_status !== 'PAID' && (
          <div>
            <InvoiceRejectionForm
              invoiceId={params.id}
              onRejected={() => {
                // Page will refresh via router refresh in Next.js
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}


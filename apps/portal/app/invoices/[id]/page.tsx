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
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Invoice #{params.id.slice(0, 8)}</h1>
        <a href="/invoices" className="na-btn na-btn-ghost">
          ← Back to Invoices
        </a>
      </div>

      <div className="na-grid na-grid-cols-1 lg:na-grid-cols-2 na-gap-6">
        {/* Status Display */}
        <div>
          <Suspense fallback={<div className="na-card na-p-6">Loading status...</div>}>
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


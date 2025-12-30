/**
 * Invoice Upload Page
 * 
 * PRD V-02: Zero Re-Typing Principle
 * - Auto-linking vendor data
 * - Missing items with specific prompts
 */

import { InvoiceUploadForm } from '@/components/invoices/InvoiceUploadForm';

export default function InvoiceUploadPage() {
  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Upload Invoice</h1>
        <a href="/invoices" className="na-btn na-btn-ghost">
          ← Back to Invoices
        </a>
      </div>

      <div className="na-max-w-2xl na-mx-auto">
        <InvoiceUploadForm />
      </div>
    </div>
  );
}


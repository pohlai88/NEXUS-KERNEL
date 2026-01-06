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
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Upload Invoice</h1>
        <a href="/invoices" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          ← Back to Invoices
        </a>
      </div>

      <div className="max-w-2xl mx-auto">
        <InvoiceUploadForm />
      </div>
    </div>
  );
}


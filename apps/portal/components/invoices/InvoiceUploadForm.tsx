/**
 * Invoice Upload Form with Auto-Linking
 * 
 * PRD V-02: Zero Re-Typing Principle
 * - Auto-links vendor data
 * - Shows missing items with specific prompts
 * - Duplicate detection
 */

'use client';

import { useState, useTransition } from 'react';
import { uploadInvoiceAction, checkDuplicateInvoiceAction } from '@/app/invoices/upload/actions';

interface MissingItem {
  type: 'GRN' | 'PO' | 'CONTRACT' | 'BANK_DETAILS' | 'TAX_ID';
  message: string;
  action_url: string;
  action_label: string;
}

interface InvoiceUploadFormProps {
  onUploadComplete?: (invoiceId: string) => void;
}

export function InvoiceUploadForm({ onUploadComplete }: InvoiceUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorTaxId, setVendorTaxId] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [missingItems, setMissingItems] = useState<MissingItem[]>([]);
  const [duplicateDetected, setDuplicateDetected] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleCheckDuplicate = async () => {
    if (!invoiceNumber) return;

    const result = await checkDuplicateInvoiceAction(invoiceNumber);
    if (result.success && result.is_duplicate) {
      setDuplicateDetected(result.existing_invoice_id || null);
      setError(`Duplicate invoice detected. Invoice ID: ${result.existing_invoice_id}`);
    } else {
      setDuplicateDetected(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setMissingItems([]);

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invoice_number', invoiceNumber);
      formData.append('invoice_date', invoiceDate);
      formData.append('vendor_name', vendorName);
      formData.append('vendor_email', vendorEmail);
      formData.append('vendor_tax_id', vendorTaxId);
      formData.append('po_number', poNumber);
      formData.append('amount', amount);

      const result = await uploadInvoiceAction(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess('Invoice uploaded successfully!');
        if (result.missing_items && result.missing_items.length > 0) {
          setMissingItems(result.missing_items);
        }
        if (result.invoice_id) {
          if (onUploadComplete) {
            onUploadComplete(result.invoice_id);
          } else {
            // Default redirect
            window.location.href = `/invoices/${result.invoice_id}`;
          }
        }
      }
    });
  };

  return (
    <div className="card p-6">
      <h2 className="text-[length:var(--nx-title-size)] leading-[var(--nx-title-line)] font-semibold tracking-tight text-nx-text-main mb-6">Upload Invoice</h2>

      {duplicateDetected && (
        <div className="card p-4 bg-nx-danger-bg text-nx-danger mb-4">
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main font-semibold">Duplicate Invoice Detected</p>
          <p className="caption text-sm mt-1">
            This invoice number already exists. Invoice ID: {duplicateDetected}
          </p>
        </div>
      )}

      {error && (
        <div className="card p-4 bg-nx-danger-bg text-nx-danger mb-4">
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{error}</p>
        </div>
      )}

      {success && (
        <div className="card p-4 bg-nx-success-bg text-nx-success mb-4">
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">{success}</p>
        </div>
      )}

      {/* Missing Items */}
      {missingItems.length > 0 && (
        <div className="card p-4 bg-nx-warning-bg mb-4">
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main font-semibold mb-2">Action Required:</p>
          <div className="space-y-2">
            {missingItems.map((item, index) => (
              <div key={index} className="card p-3 bg-nx-surface">
                <p className="caption mb-2">{item.message}</p>
                <a
                  href={item.action_url}
                  className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary text-sm"
                >
                  {item.action_label}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="caption mb-2 block">Invoice File *</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="input w-full"
            required
          />
          {file && (
            <p className="caption text-sm mt-1">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Invoice Number */}
        <div>
          <label className="caption mb-2 block">Invoice Number *</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              onBlur={handleCheckDuplicate}
              className="input flex-1"
              placeholder="INV-001"
              required
            />
            <button
              type="button"
              onClick={handleCheckDuplicate}
              className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main"
            >
              Check Duplicate
            </button>
          </div>
        </div>

        {/* Invoice Date */}
        <div>
          <label className="caption mb-2 block">Invoice Date *</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="input w-full"
            required
          />
        </div>

        {/* Vendor Information (for auto-linking) */}
        <div className="card p-4 bg-nx-info-bg">
          <p className="caption font-semibold mb-3">Vendor Information (Auto-Link)</p>
          
          <div className="space-y-3">
            <div>
              <label className="caption mb-2 block">Vendor Name</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="input w-full"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label className="caption mb-2 block">Vendor Email</label>
              <input
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                className="input w-full"
                placeholder="contact@acme.com"
              />
            </div>

            <div>
              <label className="caption mb-2 block">Tax ID</label>
              <input
                type="text"
                value={vendorTaxId}
                onChange={(e) => setVendorTaxId(e.target.value)}
                className="input w-full"
                placeholder="TAX123456"
              />
            </div>
          </div>
        </div>

        {/* PO Number */}
        <div>
          <label className="caption mb-2 block">PO Number</label>
          <input
            type="text"
            value={poNumber}
            onChange={(e) => setPoNumber(e.target.value)}
            className="input w-full"
            placeholder="PO-12345"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="caption mb-2 block">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input w-full"
            placeholder="0.00"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary w-full"
        >
          {isPending ? 'Uploading...' : 'Upload Invoice'}
        </button>
      </form>
    </div>
  );
}


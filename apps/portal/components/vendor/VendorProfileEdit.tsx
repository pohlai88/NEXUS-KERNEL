/**
 * Vendor Profile Edit Component
 * 
 * Client component for editing vendor profile information.
 * - Contact info (email, phone, address) - Direct update
 * - Display name - Direct update
 * - Bank details - Requires case creation (security)
 */

'use client';

import { useState } from 'react';
import { updateVendorContactAction, requestBankDetailsChangeAction, updateDisplayNameAction } from '@/app/vendor/profile/actions';
import Link from 'next/link';

interface VendorProfileEditProps {
  vendor: {
    id: string;
    legal_name: string;
    display_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    tax_id?: string;
    country_code?: string;
    status: string;
    bank_name?: string;
    account_number?: string;
    swift_code?: string;
    bank_address?: string;
    account_holder_name?: string;
  };
}

export function VendorProfileEdit({ vendor }: VendorProfileEditProps) {
  const [editingSection, setEditingSection] = useState<'contact' | 'display_name' | 'bank' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleContactUpdate = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateVendorContactAction(vendor.id, formData);
      if (result.success) {
        setSuccess('Contact information updated successfully');
        setEditingSection(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to update contact information');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisplayNameUpdate = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const displayName = formData.get('display_name') as string;
      const result = await updateDisplayNameAction(vendor.id, displayName);
      if (result.success) {
        setSuccess('Display name updated successfully');
        setEditingSection(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Failed to update display name');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankChangeRequest = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await requestBankDetailsChangeAction(vendor.id, formData);
      if (result.success) {
        if (result.requiresCase && result.caseId) {
          setSuccess(
            `Bank change request created. Case ID: ${result.caseId}. The finance team will review your request.`
          );
          setEditingSection(null);
          setTimeout(() => setSuccess(null), 5000);
        } else {
          setSuccess('Bank details updated successfully');
          setEditingSection(null);
          setTimeout(() => setSuccess(null), 3000);
        }
      } else {
        setError(result.error || 'Failed to create bank change request');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="na-space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="na-card na-p-4 na-bg-ok-subtle na-text-ok">
          {success}
        </div>
      )}
      {error && (
        <div className="na-card na-p-4 na-bg-danger-subtle na-text-danger">
          {error}
        </div>
      )}

      {/* Company Information */}
      <div className="na-card na-p-6">
        <div className="na-flex na-items-center na-justify-between na-mb-4">
          <h2 className="na-h3">Company Information</h2>
        </div>
        <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 na-gap-4">
          <div>
            <label className="na-metadata na-mb-2 na-block">Legal Name</label>
            <div className="na-data">{vendor.legal_name}</div>
            <div className="na-metadata na-text-xs na-mt-1">Read-only (cannot be changed)</div>
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Display Name</label>
            {editingSection === 'display_name' ? (
              <form action={handleDisplayNameUpdate} className="na-space-y-2">
                <input
                  type="text"
                  name="display_name"
                  defaultValue={vendor.display_name || ''}
                  className="na-input na-w-full"
                  required
                  minLength={2}
                  maxLength={120}
                />
                <div className="na-flex na-gap-2">
                  <button type="submit" className="na-btn na-btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSection(null)}
                    className="na-btn na-btn-ghost"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="na-data">{vendor.display_name || vendor.legal_name}</div>
                <button
                  onClick={() => setEditingSection('display_name')}
                  className="na-btn na-btn-ghost na-btn-sm na-mt-2"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Tax ID</label>
            <div className="na-data">{vendor.tax_id || 'Not provided'}</div>
            <div className="na-metadata na-text-xs na-mt-1">Read-only (contact support to change)</div>
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Country</label>
            <div className="na-data">{vendor.country_code || 'Not provided'}</div>
            <div className="na-metadata na-text-xs na-mt-1">Read-only (contact support to change)</div>
          </div>
          <div>
            <label className="na-metadata na-mb-2 na-block">Status</label>
            <span
              className={`na-status na-status-${
                vendor.status === 'active' || vendor.status === 'APPROVED'
                  ? 'ok'
                  : vendor.status === 'suspended' || vendor.status === 'REJECTED'
                    ? 'bad'
                    : 'pending'
              }`}
            >
              {vendor.status}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="na-card na-p-6">
        <div className="na-flex na-items-center na-justify-between na-mb-4">
          <h2 className="na-h3">Contact Information</h2>
          {editingSection !== 'contact' && (
            <button
              onClick={() => setEditingSection('contact')}
              className="na-btn na-btn-secondary"
            >
              Edit Contact Info
            </button>
          )}
        </div>
        {editingSection === 'contact' ? (
          <form action={handleContactUpdate} className="na-space-y-4">
            <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 na-gap-4">
              <div>
                <label className="na-metadata na-mb-2 na-block">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={vendor.email || ''}
                  className="na-input na-w-full"
                  placeholder="vendor@example.com"
                />
              </div>
              <div>
                <label className="na-metadata na-mb-2 na-block">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={vendor.phone || ''}
                  className="na-input na-w-full"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="md:na-col-span-2">
                <label className="na-metadata na-mb-2 na-block">Address</label>
                <textarea
                  name="address"
                  defaultValue={vendor.address || ''}
                  className="na-input na-w-full"
                  rows={3}
                  placeholder="Street address, City, State, ZIP"
                />
              </div>
            </div>
            <div className="na-flex na-gap-2">
              <button type="submit" className="na-btn na-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="na-btn na-btn-ghost"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 na-gap-4">
            <div>
              <label className="na-metadata na-mb-2 na-block">Email</label>
              <div className="na-data">{vendor.email || 'Not provided'}</div>
            </div>
            <div>
              <label className="na-metadata na-mb-2 na-block">Phone</label>
              <div className="na-data">{vendor.phone || 'Not provided'}</div>
            </div>
            <div className="md:na-col-span-2">
              <label className="na-metadata na-mb-2 na-block">Address</label>
              <div className="na-data">{vendor.address || 'Not provided'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Account Details */}
      <div className="na-card na-p-6">
        <div className="na-flex na-items-center na-justify-between na-mb-4">
          <h2 className="na-h3">Bank Account Details</h2>
          {editingSection !== 'bank' && (
            <button
              onClick={() => setEditingSection('bank')}
              className="na-btn na-btn-secondary"
            >
              Request Bank Change
            </button>
          )}
        </div>
        {editingSection === 'bank' ? (
          <div className="na-card na-p-4 na-bg-paper-2 na-mb-4">
            <p className="na-body na-mb-2">
              <strong>Security Notice:</strong> Bank account changes require approval for security reasons.
              Your request will be reviewed by the finance team.
            </p>
            <p className="na-metadata na-text-sm">
              A case will be created automatically for your bank change request.
            </p>
          </div>
        ) : (
          <div className="na-card na-p-4 na-bg-paper-2 na-mb-4">
            <p className="na-body">
              Bank account details are managed securely. Changes require approval.
            </p>
          </div>
        )}
        {editingSection === 'bank' ? (
          <form action={handleBankChangeRequest} className="na-space-y-4">
            <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 na-gap-4">
              <div>
                <label className="na-metadata na-mb-2 na-block">Bank Name *</label>
                <input
                  type="text"
                  name="bank_name"
                  defaultValue={vendor.bank_name || ''}
                  className="na-input na-w-full"
                  required
                  placeholder="Bank Name"
                />
              </div>
              <div>
                <label className="na-metadata na-mb-2 na-block">Account Number *</label>
                <input
                  type="text"
                  name="account_number"
                  defaultValue={vendor.account_number || ''}
                  className="na-input na-w-full"
                  required
                  placeholder="Account Number"
                />
              </div>
              <div>
                <label className="na-metadata na-mb-2 na-block">SWIFT Code</label>
                <input
                  type="text"
                  name="swift_code"
                  defaultValue={vendor.swift_code || ''}
                  className="na-input na-w-full"
                  placeholder="SWIFT/BIC Code"
                />
              </div>
              <div>
                <label className="na-metadata na-mb-2 na-block">Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder_name"
                  defaultValue={vendor.account_holder_name || ''}
                  className="na-input na-w-full"
                  placeholder="Account Holder Name"
                />
              </div>
              <div className="md:na-col-span-2">
                <label className="na-metadata na-mb-2 na-block">Bank Address</label>
                <textarea
                  name="bank_address"
                  defaultValue={vendor.bank_address || ''}
                  className="na-input na-w-full"
                  rows={2}
                  placeholder="Bank branch address"
                />
              </div>
            </div>
            <div className="na-flex na-gap-2">
              <button type="submit" className="na-btn na-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Change Request'}
              </button>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="na-btn na-btn-ghost"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="na-grid na-grid-cols-1 md:na-grid-cols-2 na-gap-4">
            <div>
              <label className="na-metadata na-mb-2 na-block">Bank Name</label>
              <div className="na-data">{vendor.bank_name || 'Not provided'}</div>
            </div>
            <div>
              <label className="na-metadata na-mb-2 na-block">Account Number</label>
              <div className="na-data na-font-mono">
                {vendor.account_number ? `****${vendor.account_number.slice(-4)}` : 'Not provided'}
              </div>
            </div>
            <div>
              <label className="na-metadata na-mb-2 na-block">SWIFT Code</label>
              <div className="na-data">{vendor.swift_code || 'Not provided'}</div>
            </div>
            <div>
              <label className="na-metadata na-mb-2 na-block">Account Holder Name</label>
              <div className="na-data">{vendor.account_holder_name || 'Not provided'}</div>
            </div>
            {vendor.bank_address && (
              <div className="md:na-col-span-2">
                <label className="na-metadata na-mb-2 na-block">Bank Address</label>
                <div className="na-data">{vendor.bank_address}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


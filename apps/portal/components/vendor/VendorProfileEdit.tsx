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
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="card p-4 bg-nx-success-bg text-nx-success">
          {success}
        </div>
      )}
      {error && (
        <div className="card p-4 bg-nx-danger-bg text-nx-danger">
          {error}
        </div>
      )}

      {/* Company Information */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section">Company Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="caption mb-2 block">Legal Name</label>
            <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.legal_name}</div>
            <div className="caption text-xs mt-1">Read-only (cannot be changed)</div>
          </div>
          <div>
            <label className="caption mb-2 block">Display Name</label>
            {editingSection === 'display_name' ? (
              <form action={handleDisplayNameUpdate} className="space-y-2">
                <input
                  type="text"
                  name="display_name"
                  defaultValue={vendor.display_name || ''}
                  className="input w-full"
                  required
                  minLength={2}
                  maxLength={120}
                />
                <div className="flex gap-2">
                  <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSection(null)}
                    className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.display_name || vendor.legal_name}</div>
                <button
                  onClick={() => setEditingSection('display_name')}
                  className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main px-3 py-1.5 text-sm mt-2"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          <div>
            <label className="caption mb-2 block">Tax ID</label>
            <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.tax_id || 'Not provided'}</div>
            <div className="caption text-xs mt-1">Read-only (contact support to change)</div>
          </div>
          <div>
            <label className="caption mb-2 block">Country</label>
            <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.country_code || 'Not provided'}</div>
            <div className="caption text-xs mt-1">Read-only (contact support to change)</div>
          </div>
          <div>
            <label className="caption mb-2 block">Status</label>
            <span
              className={`badge badge-${
                vendor.status === 'active' || vendor.status === 'APPROVED'
                  ? 'badge-success'
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
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section">Contact Information</h2>
          {editingSection !== 'contact' && (
            <button
              onClick={() => setEditingSection('contact')}
              className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary"
            >
              Edit Contact Info
            </button>
          )}
        </div>
        {editingSection === 'contact' ? (
          <form action={handleContactUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="caption mb-2 block">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={vendor.email || ''}
                  className="input w-full"
                  placeholder="vendor@example.com"
                />
              </div>
              <div>
                <label className="caption mb-2 block">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={vendor.phone || ''}
                  className="input w-full"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="caption mb-2 block">Address</label>
                <textarea
                  name="address"
                  defaultValue={vendor.address || ''}
                  className="input w-full"
                  rows={3}
                  placeholder="Street address, City, State, ZIP"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="caption mb-2 block">Email</label>
              <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.email || 'Not provided'}</div>
            </div>
            <div>
              <label className="caption mb-2 block">Phone</label>
              <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.phone || 'Not provided'}</div>
            </div>
            <div className="md:col-span-2">
              <label className="caption mb-2 block">Address</label>
              <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.address || 'Not provided'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Account Details */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section">Bank Account Details</h2>
          {editingSection !== 'bank' && (
            <button
              onClick={() => setEditingSection('bank')}
              className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary"
            >
              Request Bank Change
            </button>
          )}
        </div>
        {editingSection === 'bank' ? (
          <div className="card p-4 bg-nx-surface-well mb-4">
            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mb-2">
              <strong>Security Notice:</strong> Bank account changes require approval for security reasons.
              Your request will be reviewed by the finance team.
            </p>
            <p className="caption text-sm">
              A case will be created automatically for your bank change request.
            </p>
          </div>
        ) : (
          <div className="card p-4 bg-nx-surface-well mb-4">
            <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main">
              Bank account details are managed securely. Changes require approval.
            </p>
          </div>
        )}
        {editingSection === 'bank' ? (
          <form action={handleBankChangeRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="caption mb-2 block">Bank Name *</label>
                <input
                  type="text"
                  name="bank_name"
                  defaultValue={vendor.bank_name || ''}
                  className="input w-full"
                  required
                  placeholder="Bank Name"
                />
              </div>
              <div>
                <label className="caption mb-2 block">Account Number *</label>
                <input
                  type="text"
                  name="account_number"
                  defaultValue={vendor.account_number || ''}
                  className="input w-full"
                  required
                  placeholder="Account Number"
                />
              </div>
              <div>
                <label className="caption mb-2 block">SWIFT Code</label>
                <input
                  type="text"
                  name="swift_code"
                  defaultValue={vendor.swift_code || ''}
                  className="input w-full"
                  placeholder="SWIFT/BIC Code"
                />
              </div>
              <div>
                <label className="caption mb-2 block">Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder_name"
                  defaultValue={vendor.account_holder_name || ''}
                  className="input w-full"
                  placeholder="Account Holder Name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="caption mb-2 block">Bank Address</label>
                <textarea
                  name="bank_address"
                  defaultValue={vendor.bank_address || ''}
                  className="input w-full"
                  rows={2}
                  placeholder="Bank branch address"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Change Request'}
              </button>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="caption mb-2 block">Bank Name</label>
              <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.bank_name || 'Not provided'}</div>
            </div>
            <div>
              <label className="caption mb-2 block">Account Number</label>
              <div className="text-[length:var(--nx-body-size)] text-nx-text-main font-mono">
                {vendor.account_number ? `****${vendor.account_number.slice(-4)}` : 'Not provided'}
              </div>
            </div>
            <div>
              <label className="caption mb-2 block">SWIFT Code</label>
              <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.swift_code || 'Not provided'}</div>
            </div>
            <div>
              <label className="caption mb-2 block">Account Holder Name</label>
              <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.account_holder_name || 'Not provided'}</div>
            </div>
            {vendor.bank_address && (
              <div className="md:col-span-2">
                <label className="caption mb-2 block">Bank Address</label>
                <div className="text-[length:var(--nx-body-size)] text-nx-text-main">{vendor.bank_address}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


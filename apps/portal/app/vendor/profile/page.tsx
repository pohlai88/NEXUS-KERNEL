/**
 * Vendor Profile Page
 * 
 * Profile management for vendors - View/Edit profile, bank details, compliance documents.
 */

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase-client';
import { VendorRepository } from '@/src/repositories/vendor-repository';
import { VendorProfileEdit } from '@/components/vendor/VendorProfileEdit';
import Link from 'next/link';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      vendorId: 'default', // TODO: Get from vendor_user_access -> vendor_group -> vmp_vendors
      tenantId: null, // null = all subsidiaries
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export default async function VendorProfilePage() {
  const ctx = getRequestContext();
  const vendorRepo = new VendorRepository();

  // Get vendor profile with all fields including bank details
  // In production, this would query vendor_user_access -> vendor_group -> vmp_vendors
  const supabase = createClient();
  const vendorId = ctx.actor.vendorId || 'default'; // TODO: Get from vendor_user_access
  
  const { data: vendorData, error: vendorError } = await supabase
    .from('vmp_vendors')
    .select('id, legal_name, display_name, email, phone, address, tax_id, country_code, status, bank_name, account_number, swift_code, bank_address, account_holder_name, official_aliases')
    .eq('id', vendorId)
    .single();

  if (vendorError || !vendorData) {
    return (
      <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
        <div className="card p-6 text-center">
          <h2 className="text-base font-semibold text-nx-text-main">Vendor Profile Not Found</h2>
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mt-2">
            Your vendor profile could not be loaded. Please contact support.
          </p>
          <Link href="/vendor/dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-primary mt-4">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const vendor = vendorData;

  return (
    <div className="max-w-[var(--nx-container-max)] mx-auto mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[length:var(--nx-display-size)] leading-[var(--nx-display-line)] font-bold tracking-tight text-nx-text-main">Vendor Profile</h1>
        <Link href="/vendor/dashboard" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer bg-transparent hover:bg-nx-ghost-hover text-nx-text-main">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Profile Edit Component */}
      <VendorProfileEdit
        vendor={{
          id: vendor.id,
          legal_name: vendor.legal_name,
          display_name: vendor.display_name || undefined,
          email: vendor.email || undefined,
          phone: vendor.phone || undefined,
          address: vendor.address || undefined,
          tax_id: vendor.tax_id || undefined,
          country_code: vendor.country_code || undefined,
          status: vendor.status,
          bank_name: vendor.bank_name || undefined,
          account_number: vendor.account_number || undefined,
          swift_code: vendor.swift_code || undefined,
          bank_address: vendor.bank_address || undefined,
          account_holder_name: vendor.account_holder_name || undefined,
        }}
      />

      {/* Compliance Documents */}
      <div className="card p-6">
        <h2 className="section mb-4">Compliance Documents</h2>
        <div className="card p-4 bg-nx-surface-well">
          <p className="text-[length:var(--nx-body-size)] leading-[var(--nx-body-line)] text-nx-text-main mb-4">
            Upload and manage your compliance documents (certificates, licenses, contracts).
          </p>
          <Link href="/vendor/documents" className="inline-flex items-center justify-center rounded-[var(--nx-radius-control)] px-4 py-2 font-medium transition-colors cursor-pointer btn-secondary">
            View Document Library
          </Link>
        </div>
      </div>
    </div>
  );
}


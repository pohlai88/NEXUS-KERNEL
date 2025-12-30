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
      <div className="na-container na-mx-auto na-p-6">
        <div className="na-card na-p-6 na-text-center">
          <h2 className="na-h4">Vendor Profile Not Found</h2>
          <p className="na-body na-mt-2">
            Your vendor profile could not be loaded. Please contact support.
          </p>
          <Link href="/vendor/dashboard" className="na-btn na-btn-primary na-mt-4">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const vendor = vendorData;

  return (
    <div className="na-container na-mx-auto na-p-6">
      <div className="na-flex na-items-center na-justify-between na-mb-6">
        <h1 className="na-h1">Vendor Profile</h1>
        <Link href="/vendor/dashboard" className="na-btn na-btn-ghost">
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
      <div className="na-card na-p-6">
        <h2 className="na-h3 na-mb-4">Compliance Documents</h2>
        <div className="na-card na-p-4 na-bg-paper-2">
          <p className="na-body na-mb-4">
            Upload and manage your compliance documents (certificates, licenses, contracts).
          </p>
          <Link href="/vendor/documents" className="na-btn na-btn-secondary">
            View Document Library
          </Link>
        </div>
      </div>
    </div>
  );
}


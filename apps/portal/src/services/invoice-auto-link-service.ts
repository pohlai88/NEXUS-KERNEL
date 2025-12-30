/**
 * Invoice Auto-Link Service
 * 
 * PRD V-02: Zero Re-Typing Principle (MUST)
 * - Vendor uploads invoice once
 * - System auto-links: vendor master, bank details, tax ID, contract/PO
 * - If something is missing, system asks specifically with upload actions
 * 
 * What must never exist:
 * - Vendor re-entering data already on file
 * - "Upload invoice again" flows
 * - Email-based corrections
 */

import { createClient } from '@/lib/supabase-client';

export interface AutoLinkResult {
  vendor_id: string | null;
  vendor_linked: boolean;
  bank_details_linked: boolean;
  tax_id_linked: boolean;
  contract_linked: boolean;
  po_linked: boolean;
  missing_items: MissingItem[];
  duplicate_detected: boolean;
  duplicate_invoice_id: string | null;
}

export interface MissingItem {
  type: 'GRN' | 'PO' | 'CONTRACT' | 'BANK_DETAILS' | 'TAX_ID';
  message: string;
  action_url: string;
  action_label: string;
}

export interface InvoiceUploadData {
  invoice_number?: string;
  invoice_date?: string;
  vendor_name?: string;
  vendor_email?: string;
  vendor_tax_id?: string;
  po_number?: string;
  amount?: number;
  file_name?: string;
}

export class InvoiceAutoLinkService {
  private supabase = createClient();

  /**
   * Auto-link vendor data from invoice upload
   * PRD V-02: System auto-links vendor master, bank details, tax ID, contract/PO
   */
  async autoLink(
    uploadData: InvoiceUploadData,
    tenantId: string,
    uploadedBy: string
  ): Promise<AutoLinkResult> {
    const result: AutoLinkResult = {
      vendor_id: null,
      vendor_linked: false,
      bank_details_linked: false,
      tax_id_linked: false,
      contract_linked: false,
      po_linked: false,
      missing_items: [],
      duplicate_detected: false,
      duplicate_invoice_id: null,
    };

    // 1. Check for duplicate invoice
    if (uploadData.invoice_number) {
      const duplicate = await this.checkDuplicate(uploadData.invoice_number, tenantId);
      if (duplicate) {
        result.duplicate_detected = true;
        result.duplicate_invoice_id = duplicate.id;
        return result; // Stop processing if duplicate
      }
    }

    // 2. Auto-link vendor master
    if (uploadData.vendor_name || uploadData.vendor_email || uploadData.vendor_tax_id) {
      const vendor = await this.findVendor(
        uploadData.vendor_name,
        uploadData.vendor_email,
        uploadData.vendor_tax_id,
        tenantId
      );

      if (vendor) {
        result.vendor_id = vendor.id;
        result.vendor_linked = true;

        // 3. Auto-link bank details (from vendor master)
        if (vendor.account_number && vendor.bank_name) {
          result.bank_details_linked = true;
        } else {
          result.missing_items.push({
            type: 'BANK_DETAILS',
            message: 'Bank details missing — please update vendor profile',
            action_url: `/vendors/${vendor.id}/edit?section=bank`,
            action_label: 'Update Bank Details',
          });
        }

        // 4. Auto-link tax ID (from vendor master)
        if (vendor.tax_id) {
          result.tax_id_linked = true;
        } else {
          result.missing_items.push({
            type: 'TAX_ID',
            message: 'Tax ID missing — please update vendor profile',
            action_url: `/vendors/${vendor.id}/edit?section=tax`,
            action_label: 'Update Tax ID',
          });
        }
      } else {
        // Vendor not found - need to create or select
        result.missing_items.push({
          type: 'BANK_DETAILS', // Using as placeholder for vendor creation
          message: 'Vendor not found — please create vendor or select existing',
          action_url: '/vendors/create',
          action_label: 'Create/Select Vendor',
        });
      }
    }

    // 5. Auto-link PO (if PO number provided)
    if (uploadData.po_number && result.vendor_id) {
      const po = await this.findPO(uploadData.po_number, result.vendor_id, tenantId);
      if (po) {
        result.po_linked = true;
      } else {
        result.missing_items.push({
          type: 'PO',
          message: `PO ${uploadData.po_number} not found — please upload PO or request creation`,
          action_url: `/purchase-orders/create?po_number=${uploadData.po_number}&vendor_id=${result.vendor_id}`,
          action_label: 'Upload/Create PO',
        });
      }
    } else if (!uploadData.po_number) {
      // PO number not provided - check if required
      result.missing_items.push({
        type: 'PO',
        message: 'PO number missing — please provide PO number or upload PO document',
        action_url: `/purchase-orders/upload?vendor_id=${result.vendor_id || ''}`,
        action_label: 'Upload PO',
      });
    }

    // 6. Auto-link Contract (if vendor has active contract)
    if (result.vendor_id) {
      const contract = await this.findContract(result.vendor_id, tenantId);
      if (contract) {
        result.contract_linked = true;
      }
      // Contract is optional, so we don't add to missing_items
    }

    // 7. Check for GRN (if PO is linked)
    if (result.po_linked && uploadData.po_number) {
      const grn = await this.findGRN(uploadData.po_number, result.vendor_id!, tenantId);
      if (!grn) {
        result.missing_items.push({
          type: 'GRN',
          message: 'GRN missing — please upload Goods Receipt Note',
          action_url: `/grn/upload?po_number=${uploadData.po_number}&vendor_id=${result.vendor_id}`,
          action_label: 'Upload GRN',
        });
      }
    }

    return result;
  }

  /**
   * Check for duplicate invoice
   * PRD V-02: Prevent duplicate uploads
   */
  private async checkDuplicate(invoiceNumber: string, tenantId: string) {
    const { data, error } = await this.supabase
      .from('vmp_invoices')
      .select('id, invoice_num, invoice_number')
      .or(`invoice_num.eq.${invoiceNumber},invoice_number.eq.${invoiceNumber}`)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Error other than "not found"
      throw new Error(`Failed to check duplicate: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Find vendor by name, email, or tax ID
   */
  private async findVendor(
    vendorName?: string,
    vendorEmail?: string,
    taxId?: string,
    tenantId: string
  ) {
    let query = this.supabase
      .from('vmp_vendors')
      .select('id, name, legal_name, email, tax_id, account_number, bank_name')
      .eq('tenant_id', tenantId);

    // Try to match by tax ID first (most reliable)
    if (taxId) {
      const { data } = await query.eq('tax_id', taxId).limit(1).single();
      if (data) return data;
    }

    // Try to match by email
    if (vendorEmail) {
      const { data } = await query.eq('email', vendorEmail).limit(1).single();
      if (data) return data;
    }

    // Try to match by name (fuzzy match)
    if (vendorName) {
      const { data } = await query
        .or(`name.ilike.%${vendorName}%,legal_name.ilike.%${vendorName}%`)
        .limit(1)
        .single();
      if (data) return data;
    }

    return null;
  }

  /**
   * Find PO by PO number
   */
  private async findPO(poNumber: string, vendorId: string, tenantId: string) {
    // Get company_id from vendor (via vendor_company_links)
    const { data: vendorLink } = await this.supabase
      .from('vmp_vendor_company_links')
      .select('company_id')
      .eq('vendor_id', vendorId)
      .limit(1)
      .single();

    if (!vendorLink) return null;

    const { data, error } = await this.supabase
      .from('vmp_po_refs')
      .select('id, po_number')
      .eq('po_number', poNumber)
      .eq('vendor_id', vendorId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return null;
    }

    return data || null;
  }

  /**
   * Find GRN by PO number
   */
  private async findGRN(poNumber: string, vendorId: string, tenantId: string) {
    const { data, error } = await this.supabase
      .from('vmp_grn_refs')
      .select('id, grn_number, po_number')
      .eq('po_number', poNumber)
      .eq('vendor_id', vendorId)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return null;
    }

    return data || null;
  }

  /**
   * Find active contract for vendor
   */
  private async findContract(vendorId: string, tenantId: string) {
    // Check for active contracts (simplified - in production, use actual contract table)
    const { data, error } = await this.supabase
      .from('documents')
      .select('id, name, category')
      .eq('vendor_id', vendorId)
      .eq('category', 'contract')
      .eq('is_shared', true)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return null;
    }

    return data || null;
  }
}


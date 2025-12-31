/**
 * Purchase Order Repository
 * 
 * PO operations for vendors: View, Acknowledge, Track status.
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface PurchaseOrder {
  id: string;
  company_id: string;
  vendor_id: string;
  po_number: string;
  total_amount: number | null;
  status: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  acknowledgment_notes: string | null;
  acknowledgment_document_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcknowledgePOParams {
  po_id: string;
  action: 'accept' | 'reject';
  notes?: string;
  document_id?: string;
  acknowledged_by: string;
}

export class PORepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Find PO by ID
   */
  async findById(poId: string): Promise<PurchaseOrder | null> {
    const { data, error } = await this.supabase
      .from('vmp_po_refs')
      .select('*')
      .eq('id', poId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get PO: ${error.message}`);
    }

    return this.mapRowToPO(data);
  }

  /**
   * Get POs for vendor
   */
  async getByVendor(
    vendorId: string,
    companyIds: string[],
    filters?: { status?: string; date_from?: string; date_to?: string }
  ): Promise<PurchaseOrder[]> {
    let query = this.supabase
      .from('vmp_po_refs')
      .select('*')
      .eq('vendor_id', vendorId)
      .in('company_id', companyIds)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get POs: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToPO(row));
  }

  /**
   * Acknowledge PO (Accept/Reject)
   */
  async acknowledge(
    params: AcknowledgePOParams,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<PurchaseOrder> {
    const po = await this.findById(params.po_id);
    if (!po) {
      throw new Error('PO not found');
    }

    const newStatus = params.action === 'accept' ? 'acknowledged' : 'rejected';

    const { data: updatedPO, error } = await this.supabase
      .from('vmp_po_refs')
      .update({
        status: newStatus,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: params.acknowledged_by,
        acknowledgment_notes: params.notes || null,
        acknowledgment_document_id: params.document_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.po_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to acknowledge PO: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'purchase_order',
      entity_id: params.po_id,
      action: params.action === 'accept' ? 'acknowledge' : 'reject',
      action_by: params.acknowledged_by,
      old_state: po,
      new_state: updatedPO,
      workflow_stage: newStatus,
      workflow_state: {
        action: params.action,
        notes: params.notes,
        document_id: params.document_id,
      },
      tenant_id: po.company_id, // Using company_id as tenant_id for now
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToPO(updatedPO);
  }

  /**
   * Map database row to PurchaseOrder
   */
  private mapRowToPO(row: unknown): PurchaseOrder {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      company_id: r.company_id as string,
      vendor_id: r.vendor_id as string,
      po_number: r.po_number as string,
      total_amount: (r.total_amount as number) || null,
      status: r.status as string,
      acknowledged_at: (r.acknowledged_at as string) || null,
      acknowledged_by: (r.acknowledged_by as string) || null,
      acknowledgment_notes: (r.acknowledgment_notes as string) || null,
      acknowledgment_document_id: (r.acknowledgment_document_id as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


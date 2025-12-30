/**
 * Inter-Company Settlement Repository
 * 
 * Automated Inter-Company Settlement: Auto-flip Sales Invoice → Purchase Bill
 * Zero-touch settlement between subsidiaries.
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface InterCompanyTransaction {
  id: string;
  group_id: string;
  source_tenant_id: string;
  source_invoice_id: string | null;
  source_document_type: 'sales_invoice' | 'transfer_order';
  destination_tenant_id: string;
  destination_bill_id: string | null;
  destination_document_type: string;
  amount: number;
  currency_code: string;
  transaction_date: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'settled' | 'cancelled';
  auto_flipped: boolean;
  flipped_at: string | null;
  flipped_by: string | null;
  source_document_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AutoFlipParams {
  source_tenant_id: string;
  source_invoice_id: string;
  destination_tenant_id: string;
  amount: number;
  currency_code: string;
  transaction_date: string;
  source_document_url?: string;
}

export class InterCompanyRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Auto-Flip: Create Purchase Bill from Sales Invoice
   */
  async autoFlip(
    params: AutoFlipParams,
    groupId: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<InterCompanyTransaction> {
    // Verify destination is internal tenant (same group)
    const { data: sourceTenant } = await this.supabase
      .from('tenants')
      .select('group_id')
      .eq('id', params.source_tenant_id)
      .single();

    const { data: destTenant } = await this.supabase
      .from('tenants')
      .select('group_id')
      .eq('id', params.destination_tenant_id)
      .single();

    if (!sourceTenant || !destTenant) {
      throw new Error('Source or destination tenant not found');
    }

    if (sourceTenant.group_id !== destTenant.group_id) {
      throw new Error('Cannot create inter-company transaction between different groups');
    }

    // Create purchase bill in destination tenant
    const { data: purchaseBill, error: billError } = await this.supabase
      .from('vmp_invoices') // Assuming invoices table can be used for bills
      .insert({
        tenant_id: params.destination_tenant_id,
        vendor_id: params.source_tenant_id, // Source tenant is the "vendor" for destination
        invoice_num: `IC-${params.source_invoice_id.slice(0, 8)}`,
        invoice_date: params.transaction_date,
        amount: params.amount,
        currency_code: params.currency_code,
        status: 'draft', // Auto-created as draft, requires approval
        source_system: 'inter_company',
        erp_ref_id: params.source_invoice_id,
      })
      .select()
      .single();

    if (billError) {
      throw new Error(`Failed to create purchase bill: ${billError.message}`);
    }

    // Create inter-company transaction record
    const { data: transactionData, error } = await this.supabase
      .from('inter_company_transactions')
      .insert({
        group_id: groupId,
        source_tenant_id: params.source_tenant_id,
        source_invoice_id: params.source_invoice_id,
        source_document_type: 'sales_invoice',
        destination_tenant_id: params.destination_tenant_id,
        destination_bill_id: purchaseBill.id,
        destination_document_type: 'purchase_bill',
        amount: params.amount,
        currency_code: params.currency_code,
        transaction_date: params.transaction_date,
        status: 'pending_approval',
        auto_flipped: true,
        flipped_at: new Date().toISOString(),
        flipped_by: 'system', // TODO: Get from requestContext
        source_document_url: params.source_document_url || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create inter-company transaction: ${error.message}`);
    }

    // Create audit trail records
    await Promise.all([
      this.auditTrail.insert({
        entity_type: 'inter_company_transaction',
        entity_id: transactionData.id,
        action: 'auto_flip',
        action_by: 'system',
        new_state: transactionData,
        workflow_stage: 'pending_approval',
        workflow_state: {
          source_tenant: params.source_tenant_id,
          destination_tenant: params.destination_tenant_id,
          amount: params.amount,
        },
        tenant_id: groupId,
        ip_address: requestContext?.ip_address,
        user_agent: requestContext?.user_agent,
        request_id: requestContext?.request_id,
      }),
      this.auditTrail.insert({
        entity_type: 'invoice',
        entity_id: purchaseBill.id,
        action: 'auto_created_inter_company',
        action_by: 'system',
        new_state: purchaseBill,
        workflow_stage: 'draft',
        workflow_state: {
          inter_company_transaction_id: transactionData.id,
          source_invoice_id: params.source_invoice_id,
        },
        tenant_id: params.destination_tenant_id,
      }),
    ]);

    return this.mapRowToTransaction(transactionData);
  }

  /**
   * Get inter-company transactions for group
   */
  async getByGroup(groupId: string, status?: InterCompanyTransaction['status']): Promise<InterCompanyTransaction[]> {
    let query = this.supabase
      .from('inter_company_transactions')
      .select('*')
      .eq('group_id', groupId)
      .order('transaction_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get inter-company transactions: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToTransaction(row));
  }

  /**
   * Approve inter-company transaction
   */
  async approve(
    transactionId: string,
    approvedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<InterCompanyTransaction> {
    const transaction = await this.getById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const { data: updatedTransaction, error } = await this.supabase
      .from('inter_company_transactions')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve transaction: ${error.message}`);
    }

    // Update destination bill status
    if (transaction.destination_bill_id) {
      await this.supabase
        .from('vmp_invoices')
        .update({ status: 'approved' })
        .eq('id', transaction.destination_bill_id);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'inter_company_transaction',
      entity_id: transactionId,
      action: 'approve',
      action_by: approvedBy,
      old_state: transaction,
      new_state: updatedTransaction,
      workflow_stage: 'approved',
      workflow_state: {
        approved_by: approvedBy,
      },
      tenant_id: transaction.group_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToTransaction(updatedTransaction);
  }

  /**
   * Get by ID
   */
  async getById(transactionId: string): Promise<InterCompanyTransaction | null> {
    const { data, error } = await this.supabase
      .from('inter_company_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get transaction: ${error.message}`);
    }

    return this.mapRowToTransaction(data);
  }

  /**
   * Map database row to InterCompanyTransaction
   */
  private mapRowToTransaction(row: unknown): InterCompanyTransaction {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      group_id: r.group_id as string,
      source_tenant_id: r.source_tenant_id as string,
      source_invoice_id: (r.source_invoice_id as string) || null,
      source_document_type: r.source_document_type as InterCompanyTransaction['source_document_type'],
      destination_tenant_id: r.destination_tenant_id as string,
      destination_bill_id: (r.destination_bill_id as string) || null,
      destination_document_type: r.destination_document_type as string,
      amount: parseFloat((r.amount as number).toString()),
      currency_code: r.currency_code as string,
      transaction_date: r.transaction_date as string,
      status: r.status as InterCompanyTransaction['status'],
      auto_flipped: (r.auto_flipped as boolean) || false,
      flipped_at: (r.flipped_at as string) || null,
      flipped_by: (r.flipped_by as string) || null,
      source_document_url: (r.source_document_url as string) || null,
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


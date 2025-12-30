/**
 * Payment Repository - Flexible Payment Processing
 * 
 * Supports TWO modes:
 * 1. Standalone Mode (no ERP) - Portal creates and processes payments
 * 2. ERP Sync Mode - ERP processes payments, portal syncs/displays them
 * 
 * Payment Mode is configured per tenant in tenant settings:
 * - payment_mode: 'standalone' | 'erp_sync'
 * - erp_system: 'sap' | 'oracle' | 'netsuite' | 'custom' (if erp_sync)
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface Payment {
  id: string;
  tenant_id: string;
  vendor_id: string;
  company_id: string;
  invoice_id: string | null;
  payment_ref: string;
  payment_date: string;
  amount: number;
  currency_code: string;
  status: 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method: 'bank_transfer' | 'check' | 'wire' | 'ach' | 'other';
  source_system: 'portal' | 'erp'; // 'portal' = standalone, 'erp' = synced from ERP
  erp_ref_id: string | null; // ERP payment reference (if synced)
  erp_sync_status: 'pending' | 'synced' | 'failed' | null; // Only for ERP mode
  bank_account_last4: string | null;
  transaction_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentParams {
  tenant_id: string;
  vendor_id: string;
  company_id: string;
  invoice_id?: string;
  amount: number;
  currency_code: string;
  payment_date: string;
  payment_method?: Payment['payment_method'];
  description?: string;
  due_date?: string;
}

export interface SyncERPPaymentParams {
  tenant_id: string;
  erp_ref_id: string;
  vendor_id: string;
  company_id: string;
  invoice_id?: string;
  amount: number;
  currency_code: string;
  payment_date: string;
  payment_method: Payment['payment_method'];
  transaction_id?: string;
  bank_account_last4?: string;
  status: 'completed' | 'processing' | 'failed';
}

export interface TenantPaymentConfig {
  payment_mode: 'standalone' | 'erp_sync';
  erp_system?: string;
  erp_api_endpoint?: string;
  auto_payment_enabled: boolean;
  payment_terms_default: string; // e.g., "NET30"
}

export class PaymentRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Get tenant payment configuration (with hierarchical resolution)
   */
  async getPaymentConfig(tenantId: string, userId?: string): Promise<TenantPaymentConfig> {
    // Use ConfigResolver for hierarchical config resolution
    const { ConfigResolver } = await import('../services/config-resolver');
    const configResolver = new ConfigResolver();

    // Resolve payment config from hierarchy
    const paymentMode = await configResolver.getConfigValue<string>(
      tenantId,
      userId || null,
      null,
      'payment_config.payment_mode',
      'standalone'
    );

    const erpSystem = await configResolver.getConfigValue<string | undefined>(
      tenantId,
      userId || null,
      null,
      'payment_config.erp_system',
      undefined
    );

    const erpApiEndpoint = await configResolver.getConfigValue<string | undefined>(
      tenantId,
      userId || null,
      null,
      'payment_config.erp_api_endpoint',
      undefined
    );

    const autoPaymentEnabled = await configResolver.getConfigValue<boolean>(
      tenantId,
      userId || null,
      null,
      'payment_config.auto_payment_enabled',
      true
    );

    const paymentTermsDefault = await configResolver.getConfigValue<string>(
      tenantId,
      userId || null,
      null,
      'payment_config.payment_terms_default',
      'NET30'
    );

    return {
      payment_mode: (paymentMode as 'standalone' | 'erp_sync') || 'standalone',
      erp_system: erpSystem,
      erp_api_endpoint: erpApiEndpoint,
      auto_payment_enabled: autoPaymentEnabled ?? true,
      payment_terms_default: paymentTermsDefault || 'NET30',
    };
  }

  /**
   * Create payment (Standalone Mode)
   * Portal creates and processes the payment
   */
  async createPayment(
    params: CreatePaymentParams,
    createdBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Payment> {
    // Get payment config
    const config = await this.getPaymentConfig(params.tenant_id);

    if (config.payment_mode === 'erp_sync') {
      throw new Error('Cannot create payment in ERP sync mode. Use syncERPPayment() instead.');
    }

    // Generate payment reference
    const paymentRef = this.generatePaymentRef(params.tenant_id);

    // Get vendor bank details
    const { data: vendor } = await this.supabase
      .from('vmp_vendors')
      .select('bank_name, account_number, swift_code')
      .eq('id', params.vendor_id)
      .single();

    const bankAccountLast4 = vendor?.account_number 
      ? vendor.account_number.slice(-4) 
      : null;

    // Determine initial status
    let status: Payment['status'] = 'pending';
    if (config.auto_payment_enabled && params.payment_date <= new Date().toISOString().split('T')[0]) {
      status = 'processing'; // Auto-process if due date is today or past
    } else if (params.payment_date > new Date().toISOString().split('T')[0]) {
      status = 'scheduled'; // Schedule for future date
    }

    // Create payment record
    const { data: paymentData, error } = await this.supabase
      .from('vmp_payments')
      .insert({
        tenant_id: params.tenant_id,
        vendor_id: params.vendor_id,
        company_id: params.company_id,
        invoice_id: params.invoice_id || null,
        payment_ref: paymentRef,
        payment_date: params.payment_date,
        amount: params.amount,
        currency_code: params.currency_code,
        status: status,
        payment_method: params.payment_method || 'bank_transfer',
        source_system: 'portal',
        erp_ref_id: null,
        erp_sync_status: null,
        bank_account_last4: bankAccountLast4,
        description: params.description || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'payment',
      entity_id: paymentData.id,
      action: 'create',
      action_by: createdBy,
      new_state: paymentData,
      workflow_stage: status,
      workflow_state: {
        payment_mode: 'standalone',
        payment_ref: paymentRef,
        amount: params.amount,
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    // If auto-payment enabled and due today, process immediately
    if (status === 'processing') {
      await this.processPayment(paymentData.id, createdBy, requestContext);
    }

    return this.mapRowToPayment(paymentData);
  }

  /**
   * Sync payment from ERP (ERP Sync Mode)
   * ERP processes payment, portal syncs and displays it
   */
  async syncERPPayment(
    params: SyncERPPaymentParams,
    syncedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Payment> {
    // Check if payment already synced
    const { data: existing } = await this.supabase
      .from('vmp_payments')
      .select('*')
      .eq('erp_ref_id', params.erp_ref_id)
      .eq('tenant_id', params.tenant_id)
      .single();

    if (existing) {
      // Update existing payment
      const { data: updatedPayment, error } = await this.supabase
        .from('vmp_payments')
        .update({
          amount: params.amount,
          currency_code: params.currency_code,
          payment_date: params.payment_date,
          status: params.status,
          payment_method: params.payment_method,
          transaction_id: params.transaction_id || null,
          bank_account_last4: params.bank_account_last4 || null,
          erp_sync_status: 'synced',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update synced payment: ${error.message}`);
      }

      // Create audit trail
      await this.auditTrail.insert({
        entity_type: 'payment',
        entity_id: existing.id,
        action: 'sync_update',
        action_by: syncedBy,
        old_state: existing,
        new_state: updatedPayment,
        workflow_stage: params.status,
        workflow_state: {
          payment_mode: 'erp_sync',
          erp_ref_id: params.erp_ref_id,
        },
        tenant_id: params.tenant_id,
        ip_address: requestContext?.ip_address,
        user_agent: requestContext?.user_agent,
        request_id: requestContext?.request_id,
      });

      return this.mapRowToPayment(updatedPayment);
    }

    // Create new synced payment
    const paymentRef = this.generatePaymentRef(params.tenant_id);

    const { data: paymentData, error } = await this.supabase
      .from('vmp_payments')
      .insert({
        tenant_id: params.tenant_id,
        vendor_id: params.vendor_id,
        company_id: params.company_id,
        invoice_id: params.invoice_id || null,
        payment_ref: paymentRef,
        payment_date: params.payment_date,
        amount: params.amount,
        currency_code: params.currency_code,
        status: params.status,
        payment_method: params.payment_method,
        source_system: 'erp',
        erp_ref_id: params.erp_ref_id,
        erp_sync_status: 'synced',
        transaction_id: params.transaction_id || null,
        bank_account_last4: params.bank_account_last4 || null,
        description: `Synced from ERP: ${params.erp_ref_id}`,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to sync payment: ${error.message}`);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'payment',
      entity_id: paymentData.id,
      action: 'sync_create',
      action_by: syncedBy,
      new_state: paymentData,
      workflow_stage: params.status,
      workflow_state: {
        payment_mode: 'erp_sync',
        erp_ref_id: params.erp_ref_id,
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToPayment(paymentData);
  }

  /**
   * Process payment (Standalone Mode only)
   * Actually executes the bank transfer/check/wire
   */
  async processPayment(
    paymentId: string,
    processedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Payment> {
    const payment = await this.getById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.source_system === 'erp') {
      throw new Error('Cannot process ERP-synced payments. ERP handles processing.');
    }

    // TODO: Integrate with payment gateway/bank API
    // For now, simulate processing
    const transactionId = `TXN-${Date.now()}-${payment.id.slice(0, 8)}`;

    const { data: updatedPayment, error } = await this.supabase
      .from('vmp_payments')
      .update({
        status: 'processing',
        transaction_id: transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to process payment: ${error.message}`);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'payment',
      entity_id: paymentId,
      action: 'process',
      action_by: processedBy,
      old_state: payment,
      new_state: updatedPayment,
      workflow_stage: 'processing',
      workflow_state: {
        transaction_id: transactionId,
      },
      tenant_id: payment.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    // TODO: After actual bank transfer completes, update status to 'completed'
    // This would be done via webhook from payment gateway

    return this.mapRowToPayment(updatedPayment);
  }

  /**
   * Get payment by ID
   */
  async getById(paymentId: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('vmp_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get payment: ${error.message}`);
    }

    return this.mapRowToPayment(data);
  }

  /**
   * Get payments by invoice
   */
  async getByInvoice(invoiceId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('vmp_payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get payments: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToPayment(row));
  }

  /**
   * Generate payment reference
   */
  private generatePaymentRef(tenantId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${timestamp}-${random}`;
  }

  /**
   * Map database row to Payment
   */
  private mapRowToPayment(row: unknown): Payment {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      vendor_id: r.vendor_id as string,
      company_id: r.company_id as string,
      invoice_id: (r.invoice_id as string) || null,
      payment_ref: r.payment_ref as string,
      payment_date: r.payment_date as string,
      amount: parseFloat((r.amount as number).toString()),
      currency_code: r.currency_code as string,
      status: r.status as Payment['status'],
      payment_method: r.payment_method as Payment['payment_method'],
      source_system: r.source_system as 'portal' | 'erp',
      erp_ref_id: (r.erp_ref_id as string) || null,
      erp_sync_status: (r.erp_sync_status as Payment['erp_sync_status']) || null,
      bank_account_last4: (r.bank_account_last4 as string) || null,
      transaction_id: (r.transaction_id as string) || null,
      description: (r.description as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


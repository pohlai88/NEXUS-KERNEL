/**
 * Payment Auto-Processor Service
 * 
 * Automatically creates and processes payments after invoice auto-approval.
 * 
 * Supports TWO modes:
 * 1. Standalone Mode - Creates payment in portal, processes via payment gateway
 * 2. ERP Sync Mode - Creates payment record for ERP sync, ERP handles actual processing
 */

import { PaymentRepository, type CreatePaymentParams } from '../repositories/payment-repository';
import { InvoiceStatusRepository } from '../repositories/invoice-status-repository';
import { createClient } from '@/lib/supabase-client';

export interface AutoProcessPaymentParams {
  invoice_id: string;
  tenant_id: string;
  vendor_id: string;
  company_id: string;
  amount: number;
  currency_code: string;
  due_date: string;
  approved_by: string;
  requestContext?: { ip_address?: string; user_agent?: string; request_id?: string };
}

export interface AutoProcessPaymentResult {
  payment_created: boolean;
  payment_id: string | null;
  payment_mode: 'standalone' | 'erp_sync';
  status: 'created' | 'scheduled' | 'processing' | 'erp_sync_pending';
  message: string;
}

export class PaymentAutoProcessor {
  private paymentRepo = new PaymentRepository();
  private statusRepo = new InvoiceStatusRepository();
  private supabase = createClient();

  /**
   * Auto-process payment after invoice approval
   * 
   * Flow:
   * 1. Check tenant payment mode (standalone vs erp_sync)
   * 2. If standalone: Create payment → Process immediately (if due) or schedule
   * 3. If erp_sync: Create payment record → Mark for ERP sync → ERP processes
   */
  async autoProcessPayment(
    params: AutoProcessPaymentParams
  ): Promise<AutoProcessPaymentResult> {
    // Get payment config
    const config = await this.paymentRepo.getPaymentConfig(params.tenant_id);

    // Get invoice details
    const { data: invoice } = await this.supabase
      .from('vmp_invoices')
      .select('invoice_date, due_date, payment_terms')
      .eq('id', params.invoice_id)
      .single();

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Calculate payment date (use due_date or calculate from payment terms)
    const paymentDate = params.due_date || invoice.due_date || this.calculatePaymentDate(
      invoice.invoice_date,
      invoice.payment_terms || config.payment_terms_default
    );

    if (config.payment_mode === 'standalone') {
      // STANDALONE MODE: Portal creates and processes payment
      return await this.processStandalonePayment(params, paymentDate, config);
    } else {
      // ERP SYNC MODE: Create payment record, ERP handles processing
      return await this.processERPSyncPayment(params, paymentDate, config);
    }
  }

  /**
   * Process payment in Standalone Mode
   */
  private async processStandalonePayment(
    params: AutoProcessPaymentParams,
    paymentDate: string,
    config: Awaited<ReturnType<typeof PaymentRepository.prototype.getPaymentConfig>>
  ): Promise<AutoProcessPaymentResult> {
    // Create payment
    const paymentParams: CreatePaymentParams = {
      tenant_id: params.tenant_id,
      vendor_id: params.vendor_id,
      company_id: params.company_id,
      invoice_id: params.invoice_id,
      amount: params.amount,
      currency_code: params.currency_code,
      payment_date: paymentDate,
      payment_method: 'bank_transfer', // Default, can be configured per vendor
      description: `Auto-payment for invoice ${params.invoice_id}`,
      due_date: params.due_date,
    };

    const payment = await this.paymentRepo.createPayment(
      paymentParams,
      params.approved_by,
      params.requestContext
    );

    // Update invoice status to "PAID" if payment is processing/completed
    if (payment.status === 'processing' || payment.status === 'completed') {
      await this.statusRepo.updateStatus(
        params.invoice_id,
        {
          status: 'PAID',
          reason_code: 'AUTO_PAID',
          reason_text: `Payment ${payment.payment_ref} processed automatically`,
        },
        params.approved_by,
        params.tenant_id,
        params.requestContext
      );
    }

    return {
      payment_created: true,
      payment_id: payment.id,
      payment_mode: 'standalone',
      status: payment.status === 'processing' ? 'processing' : 
              payment.status === 'scheduled' ? 'scheduled' : 'created',
      message: `Payment ${payment.payment_ref} created in standalone mode. Status: ${payment.status}`,
    };
  }

  /**
   * Process payment in ERP Sync Mode
   */
  private async processERPSyncPayment(
    params: AutoProcessPaymentParams,
    paymentDate: string,
    config: Awaited<ReturnType<typeof PaymentRepository.prototype.getPaymentConfig>>
  ): Promise<AutoProcessPaymentResult> {
    // In ERP sync mode, we create a payment record that ERP will sync
    // The actual payment processing happens in ERP
    // We mark it as "erp_sync_pending" until ERP syncs it

    // Create payment record (ERP will sync actual payment later)
    const paymentParams: CreatePaymentParams = {
      tenant_id: params.tenant_id,
      vendor_id: params.vendor_id,
      company_id: params.company_id,
      invoice_id: params.invoice_id,
      amount: params.amount,
      currency_code: params.currency_code,
      payment_date: paymentDate,
      payment_method: 'bank_transfer',
      description: `Pending ERP sync for invoice ${params.invoice_id}`,
      due_date: params.due_date,
    };

    // Note: In ERP sync mode, we don't actually create the payment yet
    // We just mark the invoice as "APPROVED_FOR_PAYMENT" and ERP will sync the payment
    // when it processes it

    await this.statusRepo.updateStatus(
      params.invoice_id,
      {
        status: 'APPROVED_FOR_PAYMENT',
        reason_code: 'ERP_SYNC_PENDING',
        reason_text: 'Approved for payment. ERP will sync payment when processed.',
      },
      params.approved_by,
      params.tenant_id,
      params.requestContext
    );

    return {
      payment_created: false, // Payment created in ERP, not portal
      payment_id: null,
      payment_mode: 'erp_sync',
      status: 'erp_sync_pending',
      message: 'Invoice approved for payment. ERP will sync payment when processed.',
    };
  }

  /**
   * Calculate payment date from payment terms
   */
  private calculatePaymentDate(invoiceDate: string, paymentTerms: string): string {
    // Parse payment terms (e.g., "NET30" = 30 days, "NET15" = 15 days)
    const daysMatch = paymentTerms.match(/NET(\d+)/i);
    const days = daysMatch ? parseInt(daysMatch[1], 10) : 30; // Default to NET30

    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}


/**
 * ERP Payment Sync API
 * 
 * Endpoint for ERP systems to sync payments back to the portal.
 * 
 * Usage:
 * - ERP processes payment → Calls this endpoint → Portal displays payment
 * - Supports: SAP, Oracle, NetSuite, Custom ERP
 * 
 * POST /api/erp/payments/sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { PaymentRepository } from '@/src/repositories/payment-repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['tenant_id', 'erp_ref_id', 'vendor_id', 'company_id', 'amount', 'currency_code', 'payment_date', 'status'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate status
    const validStatuses = ['completed', 'processing', 'failed'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate payment method
    const validMethods = ['bank_transfer', 'check', 'wire', 'ach', 'other'];
    if (!validMethods.includes(body.payment_method)) {
      return NextResponse.json(
        { error: `Invalid payment_method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      );
    }

    // Sync payment
    const paymentRepo = new PaymentRepository();
    const payment = await paymentRepo.syncERPPayment(
      {
        tenant_id: body.tenant_id,
        erp_ref_id: body.erp_ref_id,
        vendor_id: body.vendor_id,
        company_id: body.company_id,
        invoice_id: body.invoice_id || undefined,
        amount: parseFloat(body.amount),
        currency_code: body.currency_code,
        payment_date: body.payment_date,
        payment_method: body.payment_method,
        transaction_id: body.transaction_id || undefined,
        bank_account_last4: body.bank_account_last4 || undefined,
        status: body.status,
      },
      body.synced_by || 'erp_system',
      {
        ip_address: request.headers.get('x-forwarded-for') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        request_id: crypto.randomUUID(),
      }
    );

    // Update invoice status if payment completed
    if (body.status === 'completed' && body.invoice_id) {
      const { createClient } = await import('@/lib/supabase-client');
      const supabase = createClient();
      
      await supabase
        .from('vmp_invoices')
        .update({ 
          status: 'paid',
          paid_date: body.payment_date,
          paid_amount: parseFloat(body.amount),
        })
        .eq('id', body.invoice_id);
    }

    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      message: 'Payment synced successfully',
    });
  } catch (error) {
    console.error('ERP payment sync error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to sync payment',
      },
      { status: 500 }
    );
  }
}


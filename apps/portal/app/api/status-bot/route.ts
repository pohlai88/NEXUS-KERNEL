/**
 * Status Bot API Route
 * 
 * 24/7 inquiry endpoint for vendors.
 * "Status Inv #101" → "Approved. Payment scheduled for Friday, Feb 2nd."
 */

import { NextRequest, NextResponse } from 'next/server';
import { StatusBotRepository } from '@/src/repositories/status-bot-repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inquiry_type, inquiry_identifier, vendor_id, channel, inquiry_text } = body;

    // TODO: Get tenant_id from authentication
    const tenantId = 'default'; // Placeholder

    const statusBot = new StatusBotRepository();
    const inquiry = await statusBot.inquire(
      {
        inquiry_type,
        inquiry_identifier,
        vendor_id,
        channel: channel || 'api',
        inquiry_text,
      },
      tenantId
    );

    return NextResponse.json({
      success: true,
      response: inquiry.response_message,
      status: inquiry.response_status,
      data: inquiry.response_data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process inquiry',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for simple text queries (WhatsApp bot style)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q'); // "Status Inv #101"
    const vendorId = searchParams.get('vendor_id');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Parse query (simple pattern matching)
    const invoiceMatch = query.match(/inv\s*#?(\w+)/i);
    const paymentMatch = query.match(/payment\s*#?(\w+)/i);
    const caseMatch = query.match(/case\s*#?(\w+)/i);

    let inquiryType: 'invoice_status' | 'payment_status' | 'case_status' | 'onboarding_status' = 'invoice_status';
    let inquiryIdentifier = '';

    if (invoiceMatch) {
      inquiryType = 'invoice_status';
      inquiryIdentifier = invoiceMatch[1];
    } else if (paymentMatch) {
      inquiryType = 'payment_status';
      inquiryIdentifier = paymentMatch[1];
    } else if (caseMatch) {
      inquiryType = 'case_status';
      inquiryIdentifier = caseMatch[1];
    } else {
      return NextResponse.json({
        success: false,
        error: 'Could not parse inquiry. Format: "Status Inv #101" or "Status Payment #PAY-001"',
      });
    }

    const tenantId = 'default'; // Placeholder
    const statusBot = new StatusBotRepository();
    const inquiry = await statusBot.inquire(
      {
        inquiry_type: inquiryType,
        inquiry_identifier: inquiryIdentifier,
        vendor_id: vendorId || undefined,
        channel: 'api',
        inquiry_text: query,
      },
      tenantId
    );

    return NextResponse.json({
      success: true,
      response: inquiry.response_message,
      status: inquiry.response_status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process inquiry',
      },
      { status: 500 }
    );
  }
}


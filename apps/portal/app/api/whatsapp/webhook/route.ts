/**
 * WhatsApp Webhook Route
 * 
 * Receives WhatsApp messages and handles:
 * 1. Status inquiries (Status Bot)
 * 2. Auto-reply (Deflector Shield)
 */

import { NextRequest, NextResponse } from 'next/server';
import { StatusBotRepository } from '@/src/repositories/status-bot-repository';
import { createClient } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, message, type } = body; // WhatsApp webhook format

    // Check if this is a vendor number (Deflector Shield)
    const supabase = createClient();
    const { data: autoReplyRule } = await supabase
      .from('whatsapp_auto_reply_rules')
      .select('*')
      .eq('phone_number', from)
      .eq('is_active', true)
      .single();

    if (autoReplyRule) {
      // Auto-reply: "I do not accept business inquiries here. Please log in to [Portal Link]."
      // TODO: Send WhatsApp reply via WhatsApp Business API
      return NextResponse.json({
        success: true,
        action: 'auto_reply',
        message: autoReplyRule.reply_message,
        portal_link: autoReplyRule.portal_link,
      });
    }

    // Check if message is a status inquiry
    if (type === 'text' && message) {
      const statusBot = new StatusBotRepository();
      
      // Parse inquiry (simple pattern matching)
      const invoiceMatch = message.match(/inv\s*#?(\w+)/i);
      const paymentMatch = message.match(/payment\s*#?(\w+)/i);
      const caseMatch = message.match(/case\s*#?(\w+)/i);

      if (invoiceMatch || paymentMatch || caseMatch) {
        const inquiryType = invoiceMatch
          ? 'invoice_status'
          : paymentMatch
          ? 'payment_status'
          : 'case_status';
        const inquiryIdentifier = invoiceMatch?.[1] || paymentMatch?.[1] || caseMatch?.[1];

        // Get vendor_id from phone number
        const { data: vendor } = await supabase
          .from('vmp_vendors')
          .select('id')
          .eq('phone', from)
          .single();

        const tenantId = 'default'; // TODO: Get from vendor
        const inquiry = await statusBot.inquire(
          {
            inquiry_type: inquiryType,
            inquiry_identifier: inquiryIdentifier,
            vendor_id: vendor?.id,
            channel: 'whatsapp',
            inquiry_text: message,
          },
          tenantId
        );

        // TODO: Send WhatsApp reply with status
        return NextResponse.json({
          success: true,
          action: 'status_inquiry',
          response: inquiry.response_message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      action: 'no_action',
      message: 'Message received but no action taken',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}


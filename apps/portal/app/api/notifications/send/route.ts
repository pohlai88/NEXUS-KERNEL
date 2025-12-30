/**
 * Send Notification API Route
 * 
 * Creates notification and sends via WhatsApp Magic Link.
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationRepository } from '@/src/repositories/notification-repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenant_id,
      recipient_type,
      recipient_vendor_id,
      recipient_user_id,
      notification_type,
      title,
      message,
      related_entity_type,
      related_entity_id,
      priority,
    } = body;

    const notificationRepo = new NotificationRepository();
    const notification = await notificationRepo.create(
      {
        tenant_id,
        recipient_type,
        recipient_vendor_id,
        recipient_user_id,
        notification_type,
        title,
        message,
        related_entity_type,
        related_entity_id,
        priority,
      },
      {
        request_id: crypto.randomUUID(),
      }
    );

    return NextResponse.json({
      success: true,
      notification_id: notification.id,
      whatsapp_sent: notification.whatsapp_sent,
      action_url: notification.action_url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification',
      },
      { status: 500 }
    );
  }
}


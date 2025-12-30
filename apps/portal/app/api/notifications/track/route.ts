/**
 * Track Notification Read/Click API Route
 * 
 * Read Receipt Weapon: Track when vendor reads notification or clicks link.
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationRepository } from '@/src/repositories/notification-repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification_id, action } = body; // 'read', 'click'

    const notificationRepo = new NotificationRepository();

    if (action === 'read') {
      await notificationRepo.trackWhatsAppRead(notification_id);
    } else if (action === 'click') {
      await notificationRepo.trackLinkClick(notification_id);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "read" or "click"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track notification',
      },
      { status: 500 }
    );
  }
}


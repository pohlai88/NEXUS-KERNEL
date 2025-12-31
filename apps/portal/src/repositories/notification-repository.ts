/**
 * Notification Repository with WhatsApp Integration
 * 
 * Manages Magic Link Push Notifications with read receipt tracking.
 * Every notification creates an audit record.
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface Notification {
  id: string;
  tenant_id: string;
  recipient_type: 'vendor' | 'internal' | 'both';
  recipient_vendor_id: string | null;
  recipient_user_id: string | null;
  notification_type: string;
  title: string;
  message: string;
  action_url: string | null;
  whatsapp_sent: boolean;
  whatsapp_sent_at: string | null;
  whatsapp_message_id: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  portal_sent: boolean;
  portal_sent_at: string | null;
  whatsapp_read: boolean;
  whatsapp_read_at: string | null;
  whatsapp_link_clicked: boolean;
  whatsapp_link_clicked_at: string | null;
  portal_read: boolean;
  portal_read_at: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata: Record<string, unknown>;
  created_at: string;
  expires_at: string | null;
}

export interface CreateNotificationParams {
  tenant_id: string;
  recipient_type: 'vendor' | 'internal' | 'both';
  recipient_vendor_id?: string;
  recipient_user_id?: string;
  notification_type: string;
  title: string;
  message: string;
  action_url?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
  expires_at?: string;
}

export interface MagicLinkParams {
  vendor_id: string;
  action: string; // 'fix_invoice', 'view_case', 'upload_document'
  entity_id: string;
  expires_in_hours?: number;
}

export class NotificationRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Create notification with Magic Link
   */
  async create(
    params: CreateNotificationParams,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Notification> {
    // Generate Magic Link if action_url not provided
    let actionUrl = params.action_url;
    if (!actionUrl && params.related_entity_type && params.related_entity_id) {
      actionUrl = await this.generateMagicLink({
        vendor_id: params.recipient_vendor_id || '',
        action: this.getActionFromNotificationType(params.notification_type),
        entity_id: params.related_entity_id,
      });
    }

    // Insert notification
    const { data: notificationData, error } = await this.supabase
      .from('notifications')
      .insert({
        tenant_id: params.tenant_id,
        recipient_type: params.recipient_type,
        recipient_vendor_id: params.recipient_vendor_id || null,
        recipient_user_id: params.recipient_user_id || null,
        notification_type: params.notification_type,
        title: params.title,
        message: params.message,
        action_url: actionUrl || null,
        related_entity_type: params.related_entity_type || null,
        related_entity_id: params.related_entity_id || null,
        priority: params.priority || 'normal',
        metadata: params.metadata || {},
        expires_at: params.expires_at || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    // Send via WhatsApp if vendor recipient
    if (params.recipient_type === 'vendor' || params.recipient_type === 'both') {
      await this.sendWhatsApp(notificationData.id, params.recipient_vendor_id || '');
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'notification',
      entity_id: notificationData.id,
      action: 'create',
      action_by: 'system',
      new_state: notificationData,
      workflow_stage: 'sent',
      workflow_state: {
        notification_type: params.notification_type,
        channels: {
          whatsapp: params.recipient_type === 'vendor' || params.recipient_type === 'both',
          email: false, // TODO: Implement email
          portal: true,
        },
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToNotification(notificationData);
  }

  /**
   * Generate Magic Link (secure token-based login)
   */
  async generateMagicLink(params: MagicLinkParams): Promise<string> {
    // Generate secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (params.expires_in_hours || 24));

    // Store token in metadata (in production, use dedicated token table)
    const magicLink = `/auth/magic-link?token=${token}&action=${params.action}&entity_id=${params.entity_id}`;

    // TODO: Store token in secure token table with expiration
    // For now, return the link

    return magicLink;
  }

  /**
   * Send WhatsApp notification
   */
  private async sendWhatsApp(notificationId: string, vendorId: string): Promise<void> {
    // TODO: Integrate with WhatsApp Business API
    // For now, mark as sent and log

    const { error } = await this.supabase
      .from('notifications')
      .update({
        whatsapp_sent: true,
        whatsapp_sent_at: new Date().toISOString(),
        whatsapp_message_id: `wa_${notificationId}`, // Placeholder
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Failed to mark WhatsApp as sent:', error);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'notification',
      entity_id: notificationId,
      action: 'whatsapp_sent',
      action_by: 'system',
      new_state: { whatsapp_sent: true, whatsapp_sent_at: new Date().toISOString() },
      workflow_stage: 'whatsapp_delivered',
      workflow_state: { channel: 'whatsapp' },
      tenant_id: '', // TODO: Get from notification
    });
  }

  /**
   * Track WhatsApp read receipt
   */
  async trackWhatsAppRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({
        whatsapp_read: true,
        whatsapp_read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Failed to track WhatsApp read: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'notification',
      entity_id: notificationId,
      action: 'whatsapp_read',
      action_by: 'system',
      new_state: { whatsapp_read: true, whatsapp_read_at: new Date().toISOString() },
      workflow_stage: 'read',
      workflow_state: { channel: 'whatsapp' },
      tenant_id: '', // TODO: Get from notification
    });
  }

  /**
   * Track Magic Link click
   */
  async trackLinkClick(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({
        whatsapp_link_clicked: true,
        whatsapp_link_clicked_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) {
      throw new Error(`Failed to track link click: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'notification',
      entity_id: notificationId,
      action: 'link_clicked',
      action_by: 'system',
      new_state: { whatsapp_link_clicked: true, whatsapp_link_clicked_at: new Date().toISOString() },
      workflow_stage: 'link_clicked',
      workflow_state: { channel: 'whatsapp' },
      tenant_id: '', // TODO: Get from notification
    });
  }

  /**
   * Get notifications for vendor
   */
  async getByVendor(vendorId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let query = this.supabase
      .from('notifications')
      .select('*')
      .eq('recipient_vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.or('whatsapp_read.is.null,portal_read.is.null');
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToNotification(row));
  }

  /**
   * Get action from notification type
   */
  private getActionFromNotificationType(notificationType: string): string {
    const map: Record<string, string> = {
      invoice_rejected: 'fix_invoice',
      invoice_approved: 'view_invoice',
      case_assigned: 'view_case',
      document_requested: 'upload_document',
      payment_scheduled: 'view_payment',
    };
    return map[notificationType] || 'view';
  }

  /**
   * Map database row to Notification
   */
  private mapRowToNotification(row: unknown): Notification {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      recipient_type: r.recipient_type as Notification['recipient_type'],
      recipient_vendor_id: (r.recipient_vendor_id as string) || null,
      recipient_user_id: (r.recipient_user_id as string) || null,
      notification_type: r.notification_type as string,
      title: r.title as string,
      message: r.message as string,
      action_url: (r.action_url as string) || null,
      whatsapp_sent: (r.whatsapp_sent as boolean) || false,
      whatsapp_sent_at: (r.whatsapp_sent_at as string) || null,
      whatsapp_message_id: (r.whatsapp_message_id as string) || null,
      email_sent: (r.email_sent as boolean) || false,
      email_sent_at: (r.email_sent_at as string) || null,
      portal_sent: (r.portal_sent as boolean) || false,
      portal_sent_at: (r.portal_sent_at as string) || null,
      whatsapp_read: (r.whatsapp_read as boolean) || false,
      whatsapp_read_at: (r.whatsapp_read_at as string) || null,
      whatsapp_link_clicked: (r.whatsapp_link_clicked as boolean) || false,
      whatsapp_link_clicked_at: (r.whatsapp_link_clicked_at as string) || null,
      portal_read: (r.portal_read as boolean) || false,
      portal_read_at: (r.portal_read_at as string) || null,
      related_entity_type: (r.related_entity_type as string) || null,
      related_entity_id: (r.related_entity_id as string) || null,
      priority: (r.priority as Notification['priority']) || 'normal',
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      expires_at: (r.expires_at as string) || null,
    };
  }
}


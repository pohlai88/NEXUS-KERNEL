/**
 * Staleness Repository with Notification Triggers
 *
 * PRD S-03: Silence Is a Bug
 * - No change + no explanation = defect
 * - System detects and notifies on staleness
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';
import { StalenessDetectionService, type InvoiceStaleness, type StalenessLevel } from '../services/staleness-detection-service';
import { NotificationRepository } from './notification-repository';

export interface StalenessFilters {
  staleness_level?: StalenessLevel;
  notification_sent?: boolean;
  invoice_id?: string;
}

export interface StalenessSummary {
  total: number;
  warning: number;
  critical: number;
  severe: number;
  notifications_sent: number;
  notifications_pending: number;
}

export class StalenessRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();
  private detectionService = new StalenessDetectionService();
  private notificationRepo = new NotificationRepository();

  /**
   * Detect and create staleness records
   * PRD S-03: Silence Is a Bug
   */
  async detectAndCreate(
    tenantId: string,
    detectedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<InvoiceStaleness[]> {
    // Detect stale invoices
    const detectedStaleness = await this.detectionService.detectStaleness(tenantId);

    // Create or update staleness records
    const createdStaleness: InvoiceStaleness[] = [];

    for (const staleness of detectedStaleness) {
      // Check if staleness record already exists
      const existing = await this.getByInvoice(staleness.invoice_id, tenantId);

      if (existing) {
        // Update existing record
        const { data: updatedStaleness, error } = await this.supabase
          .from('invoice_staleness')
          .update({
            days_since_last_update: staleness.days_since_last_update,
            staleness_level: staleness.staleness_level,
            last_status_change: staleness.last_status_change,
            expected_action: staleness.expected_action,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          console.error(`Failed to update staleness: ${error.message}`);
          continue;
        }

        createdStaleness.push(this.mapRowToStaleness(updatedStaleness));
      } else {
        // Create new record
        const { data: newStaleness, error } = await this.supabase
          .from('invoice_staleness')
          .insert({
            tenant_id: tenantId,
            invoice_id: staleness.invoice_id,
            status: staleness.status,
            days_since_last_update: staleness.days_since_last_update,
            staleness_level: staleness.staleness_level,
            last_status_change: staleness.last_status_change,
            expected_action: staleness.expected_action,
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to create staleness: ${error.message}`);
          continue;
        }

        createdStaleness.push(this.mapRowToStaleness(newStaleness));
      }
    }

    // Send notifications for new critical/severe staleness
    for (const staleness of createdStaleness) {
      if ((staleness.staleness_level === 'critical' || staleness.staleness_level === 'severe')
          && !staleness.notification_sent) {
        await this.sendStalenessNotification(staleness, tenantId, detectedBy, requestContext);
      }
    }

    return createdStaleness;
  }

  /**
   * Send staleness notification
   */
  private async sendStalenessNotification(
    staleness: InvoiceStaleness,
    tenantId: string,
    sentBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<void> {
    const message = this.detectionService.getStalenessMessage(staleness);

    // Create notification
    await this.notificationRepo.create({
      tenant_id: tenantId,
      recipient_type: 'vendor', // Notify vendor about staleness
      related_entity_type: 'invoice',
      related_entity_id: staleness.invoice_id,
      notification_type: 'staleness_alert',
      title: `Invoice Staleness Alert - ${staleness.staleness_level.toUpperCase()}`,
      message,
      priority: staleness.staleness_level === 'severe' ? 'high' : 'normal',
    }, requestContext);

    // Mark notification as sent
    await this.supabase
      .from('invoice_staleness')
      .update({
        notification_sent: true,
        notification_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', staleness.id);

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'invoice_staleness',
      entity_id: staleness.id,
      action: 'notify',
      action_by: sentBy,
      new_state: {
        notification_sent: true,
        notification_sent_at: new Date().toISOString(),
      },
      workflow_stage: 'notified',
      workflow_state: {
        staleness_level: staleness.staleness_level,
        days_since_last_update: staleness.days_since_last_update,
      },
      tenant_id: tenantId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });
  }

  /**
   * Get staleness records with filters
   */
  async getStaleness(filters?: StalenessFilters, tenantId?: string): Promise<InvoiceStaleness[]> {
    let query = this.supabase
      .from('invoice_staleness')
      .select('*')
      .order('staleness_level', { ascending: false }) // Severe first
      .order('days_since_last_update', { ascending: false }); // Oldest first

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    if (filters?.staleness_level) {
      query = query.eq('staleness_level', filters.staleness_level);
    }

    if (filters?.notification_sent !== undefined) {
      query = query.eq('notification_sent', filters.notification_sent);
    }

    if (filters?.invoice_id) {
      query = query.eq('invoice_id', filters.invoice_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get staleness: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToStaleness(row));
  }

  /**
   * Get staleness summary
   */
  async getSummary(tenantId: string): Promise<StalenessSummary> {
    const { data, error } = await this.supabase
      .from('invoice_staleness')
      .select('staleness_level, notification_sent')
      .eq('tenant_id', tenantId);

    if (error) {
      throw new Error(`Failed to get staleness summary: ${error.message}`);
    }

    const summary: StalenessSummary = {
      total: data?.length || 0,
      warning: 0,
      critical: 0,
      severe: 0,
      notifications_sent: 0,
      notifications_pending: 0,
    };

    for (const row of data || []) {
      const level = row.staleness_level as StalenessLevel;
      summary[level]++;

      if (row.notification_sent) {
        summary.notifications_sent++;
      } else {
        summary.notifications_pending++;
      }
    }

    return summary;
  }

  /**
   * Resolve staleness (when invoice is updated)
   */
  async resolve(
    stalenessId: string,
    resolvedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<InvoiceStaleness> {
    const currentStaleness = await this.getById(stalenessId);
    if (!currentStaleness) {
      throw new Error('Staleness record not found');
    }

    const { data: updatedStaleness, error } = await this.supabase
      .from('invoice_staleness')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', stalenessId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to resolve staleness: ${error.message}`);
    }

    // Create audit trail
    await this.auditTrail.insert({
      entity_type: 'invoice_staleness',
      entity_id: stalenessId,
      action: 'resolve',
      action_by: resolvedBy,
      old_state: currentStaleness,
      new_state: updatedStaleness,
      workflow_stage: 'resolved',
      workflow_state: {
        resolved_at: updatedStaleness.resolved_at,
      },
      tenant_id: currentStaleness.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToStaleness(updatedStaleness);
  }

  /**
   * Get staleness by ID
   */
  async getById(stalenessId: string): Promise<InvoiceStaleness | null> {
    const { data, error } = await this.supabase
      .from('invoice_staleness')
      .select('*')
      .eq('id', stalenessId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get staleness: ${error.message}`);
    }

    return this.mapRowToStaleness(data);
  }

  /**
   * Get staleness by invoice
   */
  async getByInvoice(invoiceId: string, tenantId: string): Promise<InvoiceStaleness | null> {
    const { data, error } = await this.supabase
      .from('invoice_staleness')
      .select('*')
      .eq('invoice_id', invoiceId)
      .eq('tenant_id', tenantId)
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      return null;
    }

    return this.mapRowToStaleness(data);
  }

  /**
   * Map database row to InvoiceStaleness
   */
  private mapRowToStaleness(row: unknown): InvoiceStaleness {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      invoice_id: r.invoice_id as string,
      status: r.status as string,
      days_since_last_update: r.days_since_last_update as number,
      staleness_level: r.staleness_level as StalenessLevel,
      last_status_change: (r.last_status_change as string) || null,
      expected_action: (r.expected_action as string) || null,
      notification_sent: (r.notification_sent as boolean) || false,
      notification_sent_at: (r.notification_sent_at as string) || null,
      resolved_at: (r.resolved_at as string) || null,
      resolved_by: (r.resolved_by as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


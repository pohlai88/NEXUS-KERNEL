/**
 * Staleness Detection Service
 * 
 * PRD S-03: Silence Is a Bug
 * - No change + no explanation = defect
 * - System detects invoices with no updates and no system messages
 * - Automatic notifications sent when staleness detected
 */

import { createClient } from '@/lib/supabase-client';

export type StalenessLevel = 'warning' | 'critical' | 'severe';

export interface InvoiceStaleness {
  id: string;
  tenant_id: string;
  invoice_id: string;
  status: string;
  days_since_last_update: number;
  staleness_level: StalenessLevel;
  last_status_change: string | null;
  expected_action: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StalenessDetectionResult {
  staleness_records: InvoiceStaleness[];
  warning_count: number;
  critical_count: number;
  severe_count: number;
}

export class StalenessDetectionService {
  private supabase = createClient();

  // Staleness thresholds (days)
  private readonly WARNING_THRESHOLD = 3; // 3 days without update
  private readonly CRITICAL_THRESHOLD = 7; // 7 days without update
  private readonly SEVERE_THRESHOLD = 14; // 14 days without update

  /**
   * Detect stale invoices (no change + no explanation)
   * PRD S-03: Silence Is a Bug
   */
  async detectStaleness(tenantId: string): Promise<InvoiceStaleness[]> {
    const staleInvoices: InvoiceStaleness[] = [];

    // Get all invoices that are not in final states
    const { data: invoices } = await this.supabase
      .from('vmp_invoices')
      .select('id, status, status_changed_at, updated_at, expected_next_step')
      .eq('tenant_id', tenantId)
      .not('status', 'in', '(PAID,REJECTED)')
      .not('status', 'is', null);

    if (!invoices || invoices.length === 0) {
      return staleInvoices;
    }

    for (const invoice of invoices) {
      const staleness = await this.checkInvoiceStaleness(invoice, tenantId);
      if (staleness) {
        staleInvoices.push(staleness);
      }
    }

    return staleInvoices;
  }

  /**
   * Check if a single invoice is stale
   */
  private async checkInvoiceStaleness(
    invoice: unknown,
    tenantId: string
  ): Promise<InvoiceStaleness | null> {
    const inv = invoice as Record<string, unknown>;

    // Get last status change time
    const lastStatusChange = inv.status_changed_at 
      ? new Date(inv.status_changed_at as string)
      : inv.updated_at 
        ? new Date(inv.updated_at as string)
        : null;

    if (!lastStatusChange) {
      return null; // Can't determine staleness without timestamp
    }

    // Calculate days since last update
    const daysSinceUpdate = Math.floor(
      (Date.now() - lastStatusChange.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine staleness level
    let stalenessLevel: StalenessLevel | null = null;
    if (daysSinceUpdate >= this.SEVERE_THRESHOLD) {
      stalenessLevel = 'severe';
    } else if (daysSinceUpdate >= this.CRITICAL_THRESHOLD) {
      stalenessLevel = 'critical';
    } else if (daysSinceUpdate >= this.WARNING_THRESHOLD) {
      stalenessLevel = 'warning';
    }

    if (!stalenessLevel) {
      return null; // Not stale yet
    }

    // Check if there's been a recent system message (notification, status update, etc.)
    const hasRecentActivity = await this.checkRecentActivity(inv.id as string, tenantId, lastStatusChange);
    if (hasRecentActivity) {
      return null; // Has activity, not stale
    }

    // Determine expected action based on status
    const expectedAction = this.getExpectedAction(inv.status as string, inv.expected_next_step as string | null);

    return {
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      invoice_id: inv.id as string,
      status: inv.status as string,
      days_since_last_update: daysSinceUpdate,
      staleness_level: stalenessLevel,
      last_status_change: inv.status_changed_at as string || inv.updated_at as string,
      expected_action: expectedAction,
      notification_sent: false,
      notification_sent_at: null,
      resolved_at: null,
      resolved_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Check if there's been recent activity (notifications, status updates, etc.)
   */
  private async checkRecentActivity(
    invoiceId: string,
    tenantId: string,
    sinceDate: Date
  ): Promise<boolean> {
    // Check for recent status timeline entries
    const { data: timelineEntries } = await this.supabase
      .from('invoice_status_timeline')
      .select('changed_at')
      .eq('invoice_id', invoiceId)
      .eq('tenant_id', tenantId)
      .gte('changed_at', sinceDate.toISOString())
      .limit(1);

    if (timelineEntries && timelineEntries.length > 0) {
      return true; // Has recent status change
    }

    // Check for recent audit trail entries
    const { data: auditEntries } = await this.supabase
      .from('audit_trail')
      .select('created_at')
      .eq('entity_type', 'invoice')
      .eq('entity_id', invoiceId)
      .gte('created_at', sinceDate.toISOString())
      .limit(1);

    if (auditEntries && auditEntries.length > 0) {
      return true; // Has recent activity
    }

    // Check for recent notifications
    const { data: notifications } = await this.supabase
      .from('notifications')
      .select('created_at')
      .eq('entity_type', 'invoice')
      .eq('entity_id', invoiceId)
      .gte('created_at', sinceDate.toISOString())
      .limit(1);

    if (notifications && notifications.length > 0) {
      return true; // Has recent notification
    }

    return false; // No recent activity
  }

  /**
   * Get expected action based on status
   */
  private getExpectedAction(status: string, expectedNextStep: string | null): string {
    if (expectedNextStep) {
      return expectedNextStep;
    }

    const actionMap: Record<string, string> = {
      'RECEIVED': 'Invoice will be reviewed for 3-way matching',
      'UNDER_REVIEW': 'Waiting for approval or additional documents',
      'APPROVED_FOR_PAYMENT': 'Payment will be processed in next payment cycle',
      'REJECTED': 'Please review rejection reason and take action',
    };

    return actionMap[status] || 'Please check with AP team for next steps';
  }

  /**
   * Get staleness message for notification
   */
  getStalenessMessage(staleness: InvoiceStaleness): string {
    const levelMessages: Record<StalenessLevel, string> = {
      warning: `Invoice has not been updated in ${staleness.days_since_last_update} days.`,
      critical: `Invoice has not been updated in ${staleness.days_since_last_update} days. Action required.`,
      severe: `Invoice has not been updated in ${staleness.days_since_last_update} days. Urgent action required.`,
    };

    const baseMessage = levelMessages[staleness.staleness_level];
    const actionMessage = staleness.expected_action 
      ? ` Expected: ${staleness.expected_action}`
      : '';

    return `${baseMessage}${actionMessage}`;
  }
}


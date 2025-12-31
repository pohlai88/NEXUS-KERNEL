/**
 * Auto-Approval Repository
 *
 * Exception-Only Inbox: Auto-approve perfect matches, only show exceptions.
 * "The 100 Years Back Dream: Total Silence & Total Control"
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';
import { ThreeWayMatchingRepository } from './three-way-matching-repository';

export interface AutoApprovalRule {
  id: string;
  tenant_id: string;
  rule_type: 'three_way_match' | 'soa_match' | 'invoice_validation' | 'document_completeness';
  rule_name: string;
  is_active: boolean;
  matching_score_threshold: number;
  variance_threshold: number;
  require_all_documents: boolean;
  auto_approve: boolean;
  auto_approve_by: string | null;
  notification_on_approval: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutoApprovalResult {
  approved: boolean;
  rule_id: string | null;
  matching_score: number;
  variance_amount: number;
  criteria_met: Record<string, boolean>;
  reason: string;
}

export class AutoApprovalRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();
  private matchingRepo = new ThreeWayMatchingRepository();

  /**
   * Check if invoice should be auto-approved
   */
  async checkAutoApproval(
    invoiceId: string,
    tenantId: string
  ): Promise<AutoApprovalResult> {
    // Get active auto-approval rules
    const rules = await this.getActiveRules(tenantId, 'three_way_match');
    if (rules.length === 0) {
      return {
        approved: false,
        rule_id: null,
        matching_score: 0,
        variance_amount: 0,
        criteria_met: {},
        reason: 'No auto-approval rules configured',
      };
    }

    // Get matching result
    const matches = await this.matchingRepo.getByInvoice(invoiceId);
    if (matches.length === 0) {
      return {
        approved: false,
        rule_id: null,
        matching_score: 0,
        variance_amount: 0,
        criteria_met: {},
        reason: 'No matching found',
      };
    }

    const match = matches[0];
    const rule = rules[0]; // Use first active rule

    // Check criteria
    const criteriaMet: Record<string, boolean> = {
      matching_score_threshold: (match.matching_score || 0) >= rule.matching_score_threshold,
      variance_threshold: Math.abs(match.variance_amount || 0) <= rule.variance_threshold,
      matching_status: match.matching_status === 'matched',
    };

    const allCriteriaMet = Object.values(criteriaMet).every((met) => met);

    if (allCriteriaMet && rule.auto_approve) {
      // Auto-approve
      await this.approveMatch(match.id, rule.auto_approve_by || 'system', tenantId, rule.id);

      return {
        approved: true,
        rule_id: rule.id,
        matching_score: match.matching_score || 0,
        variance_amount: match.variance_amount || 0,
        criteria_met: criteriaMet,
        reason: 'All criteria met - auto-approved',
      };
    }

    return {
      approved: false,
      rule_id: rule.id,
      matching_score: match.matching_score || 0,
      variance_amount: match.variance_amount || 0,
      criteria_met: criteriaMet,
      reason: 'Criteria not met - requires manual review',
    };
  }

  /**
   * Get exceptions only (non-auto-approved items)
   */
  async getExceptions(
    tenantId: string,
    entityType: 'invoice' | 'match' | 'case',
    filters?: { status?: string; date_from?: string; date_to?: string }
  ): Promise<unknown[]> {
    // Get all items
    let query = this.supabase.from(`vmp_${entityType}s`).select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data: allItems, error } = await query;

    if (error) {
      throw new Error(`Failed to get items: ${error.message}`);
    }

    // Filter out auto-approved items
    const exceptions: unknown[] = [];

    for (const item of allItems || []) {
      if (entityType === 'invoice') {
        const autoApproval = await this.checkAutoApproval((item as { id: string }).id, tenantId);
        if (!autoApproval.approved) {
          exceptions.push(item);
        }
      } else {
        // For other types, check if they need review
        exceptions.push(item);
      }
    }

    return exceptions;
  }

  /**
   * Approve match (auto-approval)
   */
  private async approveMatch(
    matchId: string,
    approvedBy: string,
    tenantId: string,
    ruleId: string
  ): Promise<void> {
    // Approve via matching repository
    await this.matchingRepo.approveMatch(matchId, approvedBy);

    // Log auto-approval
    const match = await this.matchingRepo.getById(matchId);
    if (match) {
      const auditTrail = await this.auditTrail.getByEntity('three_way_match', matchId);
      const latestAudit = auditTrail[auditTrail.length - 1];

      await this.supabase.from('auto_approval_log').insert({
        tenant_id: tenantId,
        rule_id: ruleId,
        entity_type: 'invoice',
        entity_id: match.invoice_id,
        matching_score: match.matching_score,
        variance_amount: match.variance_amount,
        criteria_met: {
          matching_score_threshold: true,
          variance_threshold: true,
          matching_status: true,
        },
        approved: true,
        approved_by: approvedBy,
        audit_trail_id: latestAudit?.id || null,
      });
    }
  }

  /**
   * Get active auto-approval rules
   */
  private async getActiveRules(
    tenantId: string,
    ruleType: AutoApprovalRule['rule_type']
  ): Promise<AutoApprovalRule[]> {
    const { data, error } = await this.supabase
      .from('auto_approval_rules')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('rule_type', ruleType)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get auto-approval rules: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToRule(row));
  }

  /**
   * Map database row to AutoApprovalRule
   */
  private mapRowToRule(row: unknown): AutoApprovalRule {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      rule_type: r.rule_type as AutoApprovalRule['rule_type'],
      rule_name: r.rule_name as string,
      is_active: (r.is_active as boolean) || false,
      matching_score_threshold: parseFloat((r.matching_score_threshold as number).toString()),
      variance_threshold: parseFloat((r.variance_threshold as number).toString()),
      require_all_documents: (r.require_all_documents as boolean) || false,
      auto_approve: (r.auto_approve as boolean) || false,
      auto_approve_by: (r.auto_approve_by as string) || null,
      notification_on_approval: (r.notification_on_approval as boolean) || false,
      description: (r.description as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


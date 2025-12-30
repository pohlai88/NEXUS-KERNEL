/**
 * Rejection Enforcement Service
 * 
 * PRD A-03: System-Enforced Rejection (MUST)
 * - Standardized rejection reasons (select, not type)
 * - System rules enforce: cut-off dates, approval limits, required documents
 * - Vendor sees exactly the same reason AP sees
 * 
 * What must never exist:
 * - Personal explanations typed by staff
 * - "Soft rejections" without system record
 */

import { createClient } from '@/lib/supabase-client';

export interface RejectionReasonCode {
  id: string;
  tenant_id: string;
  reason_code: string;
  reason_label: string;
  reason_description: string | null;
  category: 'DOCUMENT' | 'MATCHING' | 'DATA' | 'POLICY' | 'TIMING' | 'OTHER';
  is_active: boolean;
  sort_order: number;
  requires_explanation: boolean;
}

export interface ApprovalRule {
  id: string;
  tenant_id: string;
  rule_name: string;
  rule_type: 'CUTOFF_DATE' | 'APPROVAL_LIMIT' | 'REQUIRED_DOCUMENT' | 'VARIANCE_THRESHOLD' | 'MATCHING_SCORE';
  rule_config: Record<string, unknown>;
  is_active: boolean;
  applies_to: 'ALL' | 'VENDOR' | 'COMPANY' | 'CATEGORY';
  applies_to_id: string | null;
}

export interface RuleCheckResult {
  rule_violated: boolean;
  rule_name: string;
  rejection_reason_code: string;
  message: string;
  details: Record<string, unknown>;
}

export class RejectionEnforcementService {
  private supabase = createClient();

  /**
   * Check if invoice violates any approval rules
   * PRD A-03: System rules enforce cut-off dates, approval limits, required documents
   */
  async checkApprovalRules(
    invoiceId: string,
    tenantId: string
  ): Promise<RuleCheckResult[]> {
    const violations: RuleCheckResult[] = [];

    // Get invoice
    const { data: invoice } = await this.supabase
      .from('vmp_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return violations;
    }

    // Get active approval rules
    const { data: rules } = await this.supabase
      .from('approval_rules')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (!rules || rules.length === 0) {
      return violations; // No rules configured
    }

    // Check each rule
    for (const rule of rules) {
      const checkResult = await this.checkRule(invoice, rule as ApprovalRule, tenantId);
      if (checkResult.rule_violated) {
        violations.push(checkResult);
      }
    }

    return violations;
  }

  /**
   * Check a specific rule
   */
  private async checkRule(
    invoice: unknown,
    rule: ApprovalRule,
    tenantId: string
  ): Promise<RuleCheckResult> {
    const inv = invoice as Record<string, unknown>;

    switch (rule.rule_type) {
      case 'CUTOFF_DATE':
        return this.checkCutoffDate(inv, rule);
      case 'APPROVAL_LIMIT':
        return this.checkApprovalLimit(inv, rule);
      case 'REQUIRED_DOCUMENT':
        return this.checkRequiredDocument(inv, rule);
      case 'VARIANCE_THRESHOLD':
        return await this.checkVarianceThreshold(inv, rule, tenantId);
      case 'MATCHING_SCORE':
        return await this.checkMatchingScore(inv, rule, tenantId);
      default:
        return {
          rule_violated: false,
          rule_name: rule.rule_name,
          rejection_reason_code: '',
          message: '',
          details: {},
        };
    }
  }

  /**
   * Check cut-off date rule
   */
  private checkCutoffDate(invoice: unknown, rule: ApprovalRule): RuleCheckResult {
    const inv = invoice as Record<string, unknown>;
    const config = rule.rule_config as { cutoff_date?: string; cutoff_time?: string };

    if (!config.cutoff_date) {
      return {
        rule_violated: false,
        rule_name: rule.rule_name,
        rejection_reason_code: '',
        message: '',
        details: {},
      };
    }

    const cutoffDate = new Date(config.cutoff_date);
    const invoiceDate = new Date(inv.invoice_date as string);

    if (invoiceDate > cutoffDate) {
      return {
        rule_violated: true,
        rule_name: rule.rule_name,
        rejection_reason_code: 'REJECT_CUTOFF_MISSED',
        message: `Invoice received after payment cut-off date: ${config.cutoff_date}`,
        details: {
          cutoff_date: config.cutoff_date,
          invoice_date: inv.invoice_date,
        },
      };
    }

    return {
      rule_violated: false,
      rule_name: rule.rule_name,
      rejection_reason_code: '',
      message: '',
      details: {},
    };
  }

  /**
   * Check approval limit rule
   */
  private checkApprovalLimit(invoice: unknown, rule: ApprovalRule): RuleCheckResult {
    const inv = invoice as Record<string, unknown>;
    const config = rule.rule_config as { limit_amount?: number };

    if (!config.limit_amount) {
      return {
        rule_violated: false,
        rule_name: rule.rule_name,
        rejection_reason_code: '',
        message: '',
        details: {},
      };
    }

    const invoiceAmount = parseFloat((inv.amount as number)?.toString() || '0');

    if (invoiceAmount > config.limit_amount) {
      return {
        rule_violated: true,
        rule_name: rule.rule_name,
        rejection_reason_code: 'REJECT_APPROVAL_LIMIT_EXCEEDED',
        message: `Invoice amount ${invoiceAmount} exceeds approval limit ${config.limit_amount}`,
        details: {
          invoice_amount: invoiceAmount,
          limit_amount: config.limit_amount,
        },
      };
    }

    return {
      rule_violated: false,
      rule_name: rule.rule_name,
      rejection_reason_code: '',
      message: '',
      details: {},
    };
  }

  /**
   * Check required document rule
   */
  private checkRequiredDocument(invoice: unknown, rule: ApprovalRule): RuleCheckResult {
    const inv = invoice as Record<string, unknown>;
    const config = rule.rule_config as { required_document?: string };

    if (!config.required_document) {
      return {
        rule_violated: false,
        rule_name: rule.rule_name,
        rejection_reason_code: '',
        message: '',
        details: {},
      };
    }

    const requiredDoc = config.required_document;
    let isMissing = false;
    let reasonCode = '';

    switch (requiredDoc) {
      case 'PO':
        isMissing = !inv.po_ref;
        reasonCode = 'REJECT_MISSING_PO';
        break;
      case 'GRN':
        isMissing = !inv.grn_ref;
        reasonCode = 'REJECT_MISSING_GRN';
        break;
      case 'CONTRACT':
        // TODO: Check for contract link
        isMissing = false;
        reasonCode = 'REJECT_MISSING_CONTRACT';
        break;
    }

    if (isMissing) {
      return {
        rule_violated: true,
        rule_name: rule.rule_name,
        rejection_reason_code: reasonCode,
        message: `Required document missing: ${requiredDoc}`,
        details: {
          required_document: requiredDoc,
        },
      };
    }

    return {
      rule_violated: false,
      rule_name: rule.rule_name,
      rejection_reason_code: '',
      message: '',
      details: {},
    };
  }

  /**
   * Check variance threshold rule
   */
  private async checkVarianceThreshold(
    invoice: unknown,
    rule: ApprovalRule,
    tenantId: string
  ): Promise<RuleCheckResult> {
    const inv = invoice as Record<string, unknown>;
    const config = rule.rule_config as { threshold?: number };

    if (!config.threshold) {
      return {
        rule_violated: false,
        rule_name: rule.rule_name,
        rejection_reason_code: '',
        message: '',
        details: {},
      };
    }

    // Get 3-way matching result
    const { data: match } = await this.supabase
      .from('three_way_matching')
      .select('*')
      .eq('invoice_id', inv.id as string)
      .eq('tenant_id', tenantId)
      .limit(1)
      .single();

    if (!match) {
      return {
        rule_violated: false,
        rule_name: rule.rule_name,
        rejection_reason_code: '',
        message: '',
        details: {},
      };
    }

    const varianceAmount = Math.abs(match.variance_amount || 0);

    if (varianceAmount > config.threshold) {
      return {
        rule_violated: true,
        rule_name: rule.rule_name,
        rejection_reason_code: 'REJECT_VARIANCE_EXCEEDED',
        message: `Amount variance ${varianceAmount} exceeds threshold ${config.threshold}`,
        details: {
          variance_amount: varianceAmount,
          threshold: config.threshold,
        },
      };
    }

    return {
      rule_violated: false,
      rule_name: rule.rule_name,
      rejection_reason_code: '',
      message: '',
      details: {},
    };
  }

  /**
   * Check matching score rule
   */
  private async checkMatchingScore(
    invoice: unknown,
    rule: ApprovalRule,
    tenantId: string
  ): Promise<RuleCheckResult> {
    const inv = invoice as Record<string, unknown>;
    const config = rule.rule_config as { min_score?: number };

    if (!config.min_score) {
      return {
        rule_violated: false,
        rule_name: rule.rule_name,
        rejection_reason_code: '',
        message: '',
        details: {},
      };
    }

    // Get 3-way matching result
    const { data: match } = await this.supabase
      .from('three_way_matching')
      .select('*')
      .eq('invoice_id', inv.id as string)
      .eq('tenant_id', tenantId)
      .limit(1)
      .single();

    if (!match) {
      return {
        rule_violated: false,
        rule_name: rule.rule_name,
        rejection_reason_code: '',
        message: '',
        details: {},
      };
    }

    const matchingScore = match.matching_score || 0;

    if (matchingScore < config.min_score) {
      return {
        rule_violated: true,
        rule_name: rule.rule_name,
        rejection_reason_code: 'REJECT_MATCHING_FAILED',
        message: `Matching score ${matchingScore} below minimum ${config.min_score}`,
        details: {
          matching_score: matchingScore,
          min_score: config.min_score,
        },
      };
    }

    return {
      rule_violated: false,
      rule_name: rule.rule_name,
      rejection_reason_code: '',
      message: '',
      details: {},
    };
  }

  /**
   * Get rejection reason codes
   */
  async getRejectionReasonCodes(tenantId: string): Promise<RejectionReasonCode[]> {
    const { data, error } = await this.supabase
      .from('rejection_reason_codes')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to get rejection reason codes: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToReasonCode(row));
  }

  /**
   * Get rejection reason code by code
   */
  async getReasonCodeByCode(tenantId: string, reasonCode: string): Promise<RejectionReasonCode | null> {
    const { data, error } = await this.supabase
      .from('rejection_reason_codes')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('reason_code', reasonCode)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get rejection reason code: ${error.message}`);
    }

    return this.mapRowToReasonCode(data);
  }

  /**
   * Map database row to RejectionReasonCode
   */
  private mapRowToReasonCode(row: unknown): RejectionReasonCode {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      reason_code: r.reason_code as string,
      reason_label: r.reason_label as string,
      reason_description: (r.reason_description as string) || null,
      category: r.category as RejectionReasonCode['category'],
      is_active: (r.is_active as boolean) ?? true,
      sort_order: (r.sort_order as number) || 0,
      requires_explanation: (r.requires_explanation as boolean) || false,
    };
  }
}


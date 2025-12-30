/**
 * Rejection Repository with Code Enforcement
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
import { AuditTrailRepository } from './audit-trail-repository';
import { InvoiceStatusRepository } from './invoice-status-repository';
import { RejectionEnforcementService, type RejectionReasonCode } from '../services/rejection-enforcement-service';

export interface RejectInvoiceParams {
  reason_code: string;
  explanation?: string; // Only if reason_code requires_explanation
  notes?: string;
}

export class RejectionRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();
  private statusRepo = new InvoiceStatusRepository();
  private enforcementService = new RejectionEnforcementService();

  /**
   * Reject invoice with enforced reason code
   * PRD A-03: Standardized rejection reasons (select, not type)
   */
  async rejectInvoice(
    invoiceId: string,
    params: RejectInvoiceParams,
    rejectedBy: string,
    tenantId: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<void> {
    // 1. Validate reason code exists
    const reasonCode = await this.enforcementService.getReasonCodeByCode(tenantId, params.reason_code);
    if (!reasonCode) {
      throw new Error(`Invalid rejection reason code: ${params.reason_code}`);
    }

    // 2. Check if explanation is required
    if (reasonCode.requires_explanation && !params.explanation) {
      throw new Error(`Explanation is required for rejection reason: ${reasonCode.reason_label}`);
    }

    // 3. Check if rejection violates any rules (optional - can be warning)
    const ruleViolations = await this.enforcementService.checkApprovalRules(invoiceId, tenantId);
    // Note: We don't block rejection if rules are violated - rules are for approval, not rejection

    // 4. Update invoice status to REJECTED with reason code
    await this.statusRepo.updateStatus(
      invoiceId,
      {
        status: 'REJECTED',
        reason_code: params.reason_code,
        reason_text: reasonCode.reason_label,
        notes: params.explanation || params.notes || null,
      },
      rejectedBy,
      tenantId,
      requestContext
    );

    // 5. Create audit trail (already done by statusRepo, but add rejection-specific audit)
    await this.auditTrail.insert({
      entity_type: 'invoice',
      entity_id: invoiceId,
      action: 'reject',
      action_by: rejectedBy,
      new_state: {
        status: 'REJECTED',
        reason_code: params.reason_code,
        reason_label: reasonCode.reason_label,
        explanation: params.explanation || null,
      },
      workflow_stage: 'REJECTED',
      workflow_state: {
        rejection_reason_code: params.reason_code,
        rejection_reason_label: reasonCode.reason_label,
        rule_violations: ruleViolations.map((v) => v.rule_name),
      },
      tenant_id: tenantId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });
  }

  /**
   * Get rejection reason codes for selection
   * PRD A-03: Standardized rejection reasons (select, not type)
   */
  async getRejectionReasonCodes(tenantId: string): Promise<RejectionReasonCode[]> {
    return this.enforcementService.getRejectionReasonCodes(tenantId);
  }

  /**
   * Get rejection reason code by code
   */
  async getReasonCodeByCode(tenantId: string, reasonCode: string): Promise<RejectionReasonCode | null> {
    return this.enforcementService.getReasonCodeByCode(tenantId, reasonCode);
  }

  /**
   * Check approval rules before rejection (for validation)
   */
  async checkApprovalRules(invoiceId: string, tenantId: string) {
    return this.enforcementService.checkApprovalRules(invoiceId, tenantId);
  }
}


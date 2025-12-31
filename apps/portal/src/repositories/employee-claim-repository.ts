/**
 * Employee Claim Repository
 *
 * Claims as Invoices: Same database table, same process.
 * Employee = Vendor (Shadow Vendor).
 */

import { createServiceClient } from '@/lib/supabase-client';
import { ClaimPolicyEngine, type PolicyCheckContext } from '../domains/claims/claim-policy-engine';
import { AuditTrailRepository } from './audit-trail-repository';
import { EmployeeClaimSchema, type EmployeeClaimPayload } from '@nexus/kernel';

export interface EmployeeClaim {
  id: string;
  tenant_id: string;
  employee_id: string;
  employee_vendor_id: string;
  amount: number;
  category: string;
  merchant_name: string;
  claim_date: string;
  receipt_url: string;
  receipt_file_id: string | null;
  metadata: Record<string, unknown>;
  charge_to_tenant_id: string | null;
  status: string;
  policy_validation_passed: boolean;
  policy_validation_errors: string[];
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

// Extended claim type with tenant_id for repository operations
export interface CreateClaimParams extends EmployeeClaimPayload {
  tenant_id: string;
}

export class EmployeeClaimRepository {
  private supabase = createServiceClient();
  private policyEngine = new ClaimPolicyEngine();
  private auditTrail = new AuditTrailRepository();

  /**
   * Create employee claim (with Code Gate validation)
   */
  async create(
    claim: CreateClaimParams,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<EmployeeClaim> {
    // Get or create employee vendor profile
    const employeeVendor = await this.getOrCreateEmployeeVendor(claim.employee_id, claim.charge_to_tenant_id || claim.tenant_id);

    // Policy Check Context
    const context: PolicyCheckContext = {
      employee_id: claim.employee_id,
      tenant_id: claim.charge_to_tenant_id || claim.tenant_id,
      charge_to_tenant_id: claim.charge_to_tenant_id,
      year: new Date(claim.claim_date).getFullYear(),
    };

    // 🛡️ THE CODE GATE: Validate before database write
    const validation = await this.policyEngine.validateClaim(claim, context);

    if (!validation.passed) {
      throw new Error(`GATE_BLOCK: ${validation.errors.join(' ')}`);
    }

    // Determine status (auto-approve if policy allows)
    const status = validation.auto_approve ? 'APPROVED' : 'SUBMITTED';

    // Create claim record
    const { data: claimData, error } = await this.supabase
      .from('employee_claims')
      .insert({
        tenant_id: claim.charge_to_tenant_id || claim.tenant_id,
        employee_id: claim.employee_id,
        employee_vendor_id: employeeVendor.id,
        amount: claim.amount,
        category: claim.category,
        merchant_name: claim.merchant_name,
        claim_date: claim.claim_date.split('T')[0], // Store as date
        receipt_url: claim.receipt_url,
        receipt_file_id: claim.receipt_file_id || null,
        metadata: claim.metadata || {},
        charge_to_tenant_id: claim.charge_to_tenant_id || null,
        status: status,
        policy_validation_passed: validation.passed,
        policy_validation_errors: validation.errors,
        approved_by: validation.auto_approve ? 'system' : null,
        approved_at: validation.auto_approve ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create claim: ${error.message}`);
    }

    // Create invoice record (Claims as Invoices)
    const invoice = await this.createInvoiceFromClaim(claimData, employeeVendor.id);

    // Link claim to invoice
    await this.supabase
      .from('claim_invoice_link')
      .insert({
        claim_id: claimData.id,
        invoice_id: invoice.id,
      });

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'employee_claim',
      entity_id: claimData.id,
      action: 'create',
      action_by: claim.employee_id,
      new_state: claimData,
      workflow_stage: status.toLowerCase(),
      workflow_state: {
        category: claim.category,
        amount: claim.amount,
        auto_approve: validation.auto_approve,
        policy_validation_passed: validation.passed,
      },
      tenant_id: claim.charge_to_tenant_id || claim.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToClaim(claimData);
  }

  /**
   * Get or create employee vendor profile
   */
  private async getOrCreateEmployeeVendor(employeeId: string, tenantId: string) {
    // Check if vendor profile already exists
    const { data: existingVendor } = await this.supabase
      .from('vmp_vendors')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('tenant_id', tenantId)
      .single();

    if (existingVendor) {
      return existingVendor;
    }

    // Get employee user details
    const { data: user } = await this.supabase.auth.admin.getUserById(employeeId);
    if (!user) {
      throw new Error('Employee user not found');
    }

    // Create vendor profile for employee
    const { data: vendorData, error } = await this.supabase
      .from('vmp_vendors')
      .insert({
        tenant_id: tenantId,
        legal_name: user.user?.user_metadata?.full_name || `Employee ${employeeId.slice(0, 8)}`,
        display_name: user.user?.user_metadata?.full_name || null,
        country_code: 'US', // TODO: Get from user profile
        status: 'APPROVED', // Auto-approved for employees
        vendor_type: 'EMPLOYEE_CLAIMANT',
        employee_id: employeeId,
        official_aliases: [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create employee vendor profile: ${error.message}`);
    }

    return vendorData;
  }

  /**
   * Create invoice from claim (Claims as Invoices)
   */
  private async createInvoiceFromClaim(claim: unknown, vendorId: string) {
    const c = claim as EmployeeClaim;

    const { data: invoiceData, error } = await this.supabase
      .from('vmp_invoices')
      .insert({
        tenant_id: c.tenant_id,
        vendor_id: vendorId,
        invoice_num: `CLAIM-${c.id.slice(0, 8)}`,
        invoice_date: c.claim_date,
        amount: c.amount,
        currency_code: (c.metadata as { currency_code?: string })?.currency_code || 'USD',
        status: c.status === 'APPROVED' ? 'approved' : 'pending',
        source_system: 'employee_claim',
        erp_ref_id: c.id,
        description: `Employee Claim: ${c.category} - ${c.merchant_name}`,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create invoice from claim: ${error.message}`);
    }

    return invoiceData;
  }

  /**
   * Get claims for employee
   */
  async getByEmployee(employeeId: string, tenantId?: string): Promise<EmployeeClaim[]> {
    let query = this.supabase
      .from('employee_claims')
      .select('*')
      .eq('employee_id', employeeId)
      .order('claim_date', { ascending: false });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get claims: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToClaim(row));
  }

  /**
   * Map database row to EmployeeClaim
   */
  private mapRowToClaim(row: unknown): EmployeeClaim {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      employee_id: r.employee_id as string,
      employee_vendor_id: r.employee_vendor_id as string,
      amount: parseFloat((r.amount as number).toString()),
      category: r.category as string,
      merchant_name: r.merchant_name as string,
      claim_date: r.claim_date as string,
      receipt_url: r.receipt_url as string,
      receipt_file_id: (r.receipt_file_id as string) || null,
      metadata: (r.metadata as Record<string, unknown>) || {},
      charge_to_tenant_id: (r.charge_to_tenant_id as string) || null,
      status: r.status as string,
      policy_validation_passed: (r.policy_validation_passed as boolean) || false,
      policy_validation_errors: (r.policy_validation_errors as string[]) || [],
      approved_by: (r.approved_by as string) || null,
      approved_at: (r.approved_at as string) || null,
      rejected_by: (r.rejected_by as string) || null,
      rejected_at: (r.rejected_at as string) || null,
      rejection_reason: (r.rejection_reason as string) || null,
      paid_at: (r.paid_at as string) || null,
      payment_reference: (r.payment_reference as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


/**
 * Supplier Offboarding Repository with Audit Trail
 *
 * Manages supplier offboarding workflow with automatic audit trail logging.
 * Every offboarding action creates an immutable audit record.
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';
import { CaseRepository } from './case-repository';

export interface OffboardingStage {
  id: string;
  tenant_id: string;
  vendor_id: string;
  case_id: string;
  stage: 'requested' | 'review' | 'approval' | 'data_export' | 'access_revocation' | 'completed' | 'cancelled';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  reason: string;
  requested_by: string;
  requested_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  completed_at: string | null;
  cancellation_reason: string | null;
  data_export_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOffboardingParams {
  tenant_id: string;
  vendor_id: string;
  company_id: string;
  reason: string;
  effective_date?: string; // When offboarding should take effect
}

export interface UpdateOffboardingStageParams {
  stage?: OffboardingStage['stage'];
  status?: OffboardingStage['status'];
  rejected_reason?: string;
  cancellation_reason?: string;
  data_export_url?: string;
}

export class SupplierOffboardingRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();
  private caseRepo = new CaseRepository();

  /**
   * Create offboarding request with case and audit trail
   */
  async create(
    params: CreateOffboardingParams,
    requestedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OffboardingStage> {
    // Create offboarding case
    const offboardingCase = await this.caseRepo.create(
      {
        tenant_id: params.tenant_id,
        company_id: params.company_id,
        vendor_id: params.vendor_id,
        case_type: 'general', // offboarding cases are categorized as general
        subject: `Supplier Offboarding Request: ${params.vendor_id}`,
        owner_team: 'procurement',
        tags: ['offboarding_request', 'vendor_request'],
      },
      requestedBy,
      requestContext
    );

    // Insert offboarding stage
    const { data: stageData, error } = await this.supabase
      .from('supplier_offboarding')
      .insert({
        tenant_id: params.tenant_id,
        vendor_id: params.vendor_id,
        case_id: offboardingCase.id,
        stage: 'requested',
        status: 'pending',
        reason: params.reason,
        requested_by: requestedBy,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create offboarding: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_offboarding',
      entity_id: stageData.id,
      action: 'create',
      action_by: requestedBy,
      new_state: stageData,
      workflow_stage: 'requested',
      workflow_state: {
        stage: 'requested',
        status: 'pending',
        case_id: offboardingCase.id,
        vendor_id: params.vendor_id,
        reason: params.reason,
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToStage(stageData);
  }

  /**
   * Update offboarding stage with audit trail
   */
  async updateStage(
    offboardingId: string,
    params: UpdateOffboardingStageParams,
    updatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OffboardingStage> {
    // Get current offboarding state
    const currentOffboarding = await this.getById(offboardingId);
    if (!currentOffboarding) {
      throw new Error('Offboarding not found');
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (params.stage !== undefined) updatePayload.stage = params.stage;
    if (params.status !== undefined) updatePayload.status = params.status;
    if (params.rejected_reason !== undefined) updatePayload.rejected_reason = params.rejected_reason;
    if (params.cancellation_reason !== undefined) updatePayload.cancellation_reason = params.cancellation_reason;
    if (params.data_export_url !== undefined) updatePayload.data_export_url = params.data_export_url;

    // Update offboarding
    const { data: updatedOffboarding, error } = await this.supabase
      .from('supplier_offboarding')
      .update(updatePayload)
      .eq('id', offboardingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update offboarding: ${error.message}`);
    }

    // Calculate changes
    const changes: Record<string, unknown> = {};
    if (params.stage && params.stage !== currentOffboarding.stage) {
      changes.stage = { from: currentOffboarding.stage, to: params.stage };
    }
    if (params.status && params.status !== currentOffboarding.status) {
      changes.status = { from: currentOffboarding.status, to: params.status };
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_offboarding',
      entity_id: offboardingId,
      action: 'update',
      action_by: updatedBy,
      old_state: currentOffboarding,
      new_state: updatedOffboarding,
      changes,
      workflow_stage: updatedOffboarding.stage,
      workflow_state: {
        stage: updatedOffboarding.stage,
        status: updatedOffboarding.status,
        case_id: updatedOffboarding.case_id,
        vendor_id: updatedOffboarding.vendor_id,
      },
      tenant_id: currentOffboarding.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToStage(updatedOffboarding);
  }

  /**
   * Approve offboarding with audit trail
   */
  async approve(
    offboardingId: string,
    approvedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OffboardingStage> {
    const currentOffboarding = await this.getById(offboardingId);
    if (!currentOffboarding) {
      throw new Error('Offboarding not found');
    }

    const { data: updatedOffboarding, error } = await this.supabase
      .from('supplier_offboarding')
      .update({
        stage: 'review',
        status: 'in_progress',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', offboardingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve offboarding: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_offboarding',
      entity_id: offboardingId,
      action: 'approve',
      action_by: approvedBy,
      old_state: currentOffboarding,
      new_state: updatedOffboarding,
      workflow_stage: 'review',
      workflow_state: {
        stage: 'review',
        status: 'in_progress',
        approved_by: approvedBy,
        approved_at: updatedOffboarding.approved_at,
      },
      tenant_id: currentOffboarding.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToStage(updatedOffboarding);
  }

  /**
   * Complete offboarding (finalize access revocation)
   */
  async complete(
    offboardingId: string,
    completedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OffboardingStage> {
    const currentOffboarding = await this.getById(offboardingId);
    if (!currentOffboarding) {
      throw new Error('Offboarding not found');
    }

    const { data: updatedOffboarding, error } = await this.supabase
      .from('supplier_offboarding')
      .update({
        stage: 'completed',
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', offboardingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to complete offboarding: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_offboarding',
      entity_id: offboardingId,
      action: 'complete',
      action_by: completedBy,
      old_state: currentOffboarding,
      new_state: updatedOffboarding,
      workflow_stage: 'completed',
      workflow_state: {
        stage: 'completed',
        status: 'completed',
        completed_at: updatedOffboarding.completed_at,
      },
      tenant_id: currentOffboarding.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    // Update vendor status to SUSPENDED
    await this.supabase
      .from('vmp_vendors')
      .update({ status: 'SUSPENDED' })
      .eq('id', currentOffboarding.vendor_id);

    return this.mapRowToStage(updatedOffboarding);
  }

  /**
   * Reject offboarding with audit trail
   */
  async reject(
    offboardingId: string,
    reason: string,
    rejectedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OffboardingStage> {
    const currentOffboarding = await this.getById(offboardingId);
    if (!currentOffboarding) {
      throw new Error('Offboarding not found');
    }

    const { data: updatedOffboarding, error } = await this.supabase
      .from('supplier_offboarding')
      .update({
        stage: 'cancelled',
        status: 'rejected',
        rejected_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', offboardingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject offboarding: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_offboarding',
      entity_id: offboardingId,
      action: 'reject',
      action_by: rejectedBy,
      old_state: currentOffboarding,
      new_state: updatedOffboarding,
      workflow_stage: 'cancelled',
      workflow_state: {
        stage: 'cancelled',
        status: 'rejected',
        rejected_reason: reason,
      },
      tenant_id: currentOffboarding.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToStage(updatedOffboarding);
  }

  /**
   * Cancel offboarding (vendor-initiated)
   */
  async cancel(
    offboardingId: string,
    reason: string,
    cancelledBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OffboardingStage> {
    const currentOffboarding = await this.getById(offboardingId);
    if (!currentOffboarding) {
      throw new Error('Offboarding not found');
    }

    const { data: updatedOffboarding, error } = await this.supabase
      .from('supplier_offboarding')
      .update({
        stage: 'cancelled',
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', offboardingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel offboarding: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_offboarding',
      entity_id: offboardingId,
      action: 'cancel',
      action_by: cancelledBy,
      old_state: currentOffboarding,
      new_state: updatedOffboarding,
      workflow_stage: 'cancelled',
      workflow_state: {
        stage: 'cancelled',
        status: 'cancelled',
        cancellation_reason: reason,
      },
      tenant_id: currentOffboarding.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToStage(updatedOffboarding);
  }

  /**
   * Get offboarding by ID
   */
  async getById(offboardingId: string): Promise<OffboardingStage | null> {
    const { data, error } = await this.supabase
      .from('supplier_offboarding')
      .select('*')
      .eq('id', offboardingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get offboarding: ${error.message}`);
    }

    return this.mapRowToStage(data);
  }

  /**
   * Get offboarding by vendor ID
   */
  async getByVendor(vendorId: string): Promise<OffboardingStage | null> {
    const { data, error } = await this.supabase
      .from('supplier_offboarding')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get offboarding: ${error.message}`);
    }

    return this.mapRowToStage(data);
  }

  /**
   * Get audit trail for offboarding
   */
  async getAuditTrail(offboardingId: string) {
    return this.auditTrail.getByEntity('supplier_offboarding', offboardingId);
  }

  /**
   * Map database row to OffboardingStage
   */
  private mapRowToStage(row: unknown): OffboardingStage {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      vendor_id: r.vendor_id as string,
      case_id: r.case_id as string,
      stage: r.stage as OffboardingStage['stage'],
      status: r.status as OffboardingStage['status'],
      reason: r.reason as string,
      requested_by: r.requested_by as string,
      requested_at: r.requested_at as string,
      approved_by: (r.approved_by as string) || null,
      approved_at: (r.approved_at as string) || null,
      rejected_reason: (r.rejected_reason as string) || null,
      completed_at: (r.completed_at as string) || null,
      cancellation_reason: (r.cancellation_reason as string) || null,
      data_export_url: (r.data_export_url as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


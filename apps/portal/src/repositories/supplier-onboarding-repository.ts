/**
 * Supplier Onboarding Repository with Audit Trail
 * 
 * Manages supplier onboarding workflow with automatic audit trail logging.
 * Every onboarding stage creates an immutable audit record.
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';
import { CaseRepository } from './case-repository';

export interface OnboardingStage {
  id: string;
  tenant_id: string;
  vendor_id: string;
  case_id: string;
  stage: 'submitted' | 'document_collection' | 'verification' | 'approval' | 'document_signing' | 'completed' | 'rejected';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'waived';
  checklist_items: unknown[]; // JSONB array of checklist items
  required_documents: unknown[]; // JSONB array of required documents
  submitted_documents: unknown[]; // JSONB array of submitted documents
  verification_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOnboardingParams {
  tenant_id: string;
  vendor_id: string;
  company_id: string;
  required_documents?: unknown[];
  checklist_items?: unknown[];
}

export interface UpdateOnboardingStageParams {
  stage?: OnboardingStage['stage'];
  status?: OnboardingStage['status'];
  submitted_documents?: unknown[];
  verification_notes?: string;
  rejected_reason?: string;
}

export class SupplierOnboardingRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();
  private caseRepo = new CaseRepository();

  /**
   * Create onboarding workflow with case and audit trail
   */
  async create(
    params: CreateOnboardingParams,
    createdBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OnboardingStage> {
    // Create onboarding case
    const onboardingCase = await this.caseRepo.create(
      {
        tenant_id: params.tenant_id,
        company_id: params.company_id,
        vendor_id: params.vendor_id,
        case_type: 'onboarding',
        subject: `Supplier Onboarding: ${params.vendor_id}`,
        owner_team: 'procurement',
      },
      createdBy,
      requestContext
    );

    // Insert onboarding stage
    const { data: stageData, error } = await this.supabase
      .from('supplier_onboarding')
      .insert({
        tenant_id: params.tenant_id,
        vendor_id: params.vendor_id,
        case_id: onboardingCase.id,
        stage: 'submitted',
        status: 'pending',
        checklist_items: params.checklist_items || [],
        required_documents: params.required_documents || [],
        submitted_documents: [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create onboarding: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_onboarding',
      entity_id: stageData.id,
      action: 'create',
      action_by: createdBy,
      new_state: stageData,
      workflow_stage: 'submitted',
      workflow_state: {
        stage: 'submitted',
        status: 'pending',
        case_id: onboardingCase.id,
        vendor_id: params.vendor_id,
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToStage(stageData);
  }

  /**
   * Update onboarding stage with audit trail
   */
  async updateStage(
    onboardingId: string,
    params: UpdateOnboardingStageParams,
    updatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OnboardingStage> {
    // Get current onboarding state
    const currentOnboarding = await this.getById(onboardingId);
    if (!currentOnboarding) {
      throw new Error('Onboarding not found');
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (params.stage !== undefined) updatePayload.stage = params.stage;
    if (params.status !== undefined) updatePayload.status = params.status;
    if (params.submitted_documents !== undefined) updatePayload.submitted_documents = params.submitted_documents;
    if (params.verification_notes !== undefined) updatePayload.verification_notes = params.verification_notes;
    if (params.rejected_reason !== undefined) updatePayload.rejected_reason = params.rejected_reason;

    // Update onboarding
    const { data: updatedOnboarding, error } = await this.supabase
      .from('supplier_onboarding')
      .update(updatePayload)
      .eq('id', onboardingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update onboarding: ${error.message}`);
    }

    // Calculate changes
    const changes: Record<string, unknown> = {};
    if (params.stage && params.stage !== currentOnboarding.stage) {
      changes.stage = { from: currentOnboarding.stage, to: params.stage };
    }
    if (params.status && params.status !== currentOnboarding.status) {
      changes.status = { from: currentOnboarding.status, to: params.status };
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_onboarding',
      entity_id: onboardingId,
      action: 'update',
      action_by: updatedBy,
      old_state: currentOnboarding,
      new_state: updatedOnboarding,
      changes,
      workflow_stage: updatedOnboarding.stage,
      workflow_state: {
        stage: updatedOnboarding.stage,
        status: updatedOnboarding.status,
        case_id: updatedOnboarding.case_id,
        vendor_id: updatedOnboarding.vendor_id,
      },
      tenant_id: currentOnboarding.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToStage(updatedOnboarding);
  }

  /**
   * Approve onboarding with audit trail
   */
  async approve(
    onboardingId: string,
    approvedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OnboardingStage> {
    const currentOnboarding = await this.getById(onboardingId);
    if (!currentOnboarding) {
      throw new Error('Onboarding not found');
    }

    const { data: updatedOnboarding, error } = await this.supabase
      .from('supplier_onboarding')
      .update({
        stage: 'completed',
        status: 'completed',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', onboardingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve onboarding: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_onboarding',
      entity_id: onboardingId,
      action: 'approve',
      action_by: approvedBy,
      old_state: currentOnboarding,
      new_state: updatedOnboarding,
      workflow_stage: 'completed',
      workflow_state: {
        stage: 'completed',
        status: 'completed',
        approved_by: approvedBy,
        approved_at: updatedOnboarding.approved_at,
      },
      tenant_id: currentOnboarding.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    // Also update vendor status
    await this.supabase
      .from('vmp_vendors')
      .update({ status: 'active' })
      .eq('id', currentOnboarding.vendor_id);

    return this.mapRowToStage(updatedOnboarding);
  }

  /**
   * Reject onboarding with audit trail
   */
  async reject(
    onboardingId: string,
    reason: string,
    rejectedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<OnboardingStage> {
    const currentOnboarding = await this.getById(onboardingId);
    if (!currentOnboarding) {
      throw new Error('Onboarding not found');
    }

    const { data: updatedOnboarding, error } = await this.supabase
      .from('supplier_onboarding')
      .update({
        stage: 'rejected',
        status: 'rejected',
        rejected_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', onboardingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reject onboarding: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_onboarding',
      entity_id: onboardingId,
      action: 'reject',
      action_by: rejectedBy,
      old_state: currentOnboarding,
      new_state: updatedOnboarding,
      workflow_stage: 'rejected',
      workflow_state: {
        stage: 'rejected',
        status: 'rejected',
        rejected_reason: reason,
      },
      tenant_id: currentOnboarding.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToStage(updatedOnboarding);
  }

  /**
   * Get onboarding by ID
   */
  async getById(onboardingId: string): Promise<OnboardingStage | null> {
    const { data, error } = await this.supabase
      .from('supplier_onboarding')
      .select('*')
      .eq('id', onboardingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get onboarding: ${error.message}`);
    }

    return this.mapRowToStage(data);
  }

  /**
   * Get onboarding by vendor ID
   */
  async getByVendor(vendorId: string): Promise<OnboardingStage | null> {
    const { data, error } = await this.supabase
      .from('supplier_onboarding')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get onboarding: ${error.message}`);
    }

    return this.mapRowToStage(data);
  }

  /**
   * Get audit trail for onboarding
   */
  async getAuditTrail(onboardingId: string) {
    return this.auditTrail.getByEntity('supplier_onboarding', onboardingId);
  }

  /**
   * Map database row to OnboardingStage
   */
  private mapRowToStage(row: unknown): OnboardingStage {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      vendor_id: r.vendor_id as string,
      case_id: r.case_id as string,
      stage: r.stage as OnboardingStage['stage'],
      status: r.status as OnboardingStage['status'],
      checklist_items: (r.checklist_items as unknown[]) || [],
      required_documents: (r.required_documents as unknown[]) || [],
      submitted_documents: (r.submitted_documents as unknown[]) || [],
      verification_notes: (r.verification_notes as string) || null,
      approved_by: (r.approved_by as string) || null,
      approved_at: (r.approved_at as string) || null,
      rejected_reason: (r.rejected_reason as string) || null,
      completed_at: (r.completed_at as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


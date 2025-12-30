/**
 * Case Repository with Audit Trail Integration
 * 
 * Manages case operations with automatic audit trail logging.
 * Every case action creates an immutable audit record.
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface Case {
  id: string;
  tenant_id: string;
  company_id: string;
  vendor_id: string;
  case_type: 'onboarding' | 'invoice' | 'payment' | 'soa' | 'general';
  status: 'open' | 'waiting_supplier' | 'waiting_internal' | 'resolved' | 'blocked';
  subject: string;
  owner_team: 'procurement' | 'ap' | 'finance';
  sla_due_at: string | null;
  escalation_level: number;
  assigned_to_user_id: string | null;
  group_id: string | null;
  linked_invoice_id: string | null;
  linked_po_id: string | null;
  linked_grn_id: string | null;
  linked_payment_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CaseFilters {
  status?: string;
  case_type?: string;
  vendor_id?: string;
  company_id?: string;
  owner_team?: string;
  assigned_to_user_id?: string;
  tags?: string[];
}

export interface CreateCaseParams {
  tenant_id: string;
  company_id: string;
  vendor_id: string;
  case_type: Case['case_type'];
  subject: string;
  owner_team: Case['owner_team'];
  linked_invoice_id?: string;
  linked_po_id?: string;
  linked_grn_id?: string;
  linked_payment_id?: string;
  tags?: string[];
  sla_due_at?: string;
}

export interface UpdateCaseParams {
  status?: Case['status'];
  assigned_to_user_id?: string | null;
  owner_team?: Case['owner_team'];
  escalation_level?: number;
  subject?: string;
  tags?: string[];
  sla_due_at?: string | null;
}

export class CaseRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Create a new case with audit trail
   */
  async create(
    params: CreateCaseParams,
    createdBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Case> {
    // Insert case
    const { data: caseData, error } = await this.supabase
      .from('vmp_cases')
      .insert({
        tenant_id: params.tenant_id,
        company_id: params.company_id,
        vendor_id: params.vendor_id,
        case_type: params.case_type,
        status: 'open',
        subject: params.subject,
        owner_team: params.owner_team,
        linked_invoice_id: params.linked_invoice_id || null,
        linked_po_id: params.linked_po_id || null,
        linked_grn_id: params.linked_grn_id || null,
        linked_payment_id: params.linked_payment_id || null,
        tags: params.tags || [],
        sla_due_at: params.sla_due_at || null,
        escalation_level: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create case: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'case',
      entity_id: caseData.id,
      action: 'create',
      action_by: createdBy,
      new_state: caseData,
      workflow_stage: 'open',
      workflow_state: {
        status: 'open',
        case_type: params.case_type,
        owner_team: params.owner_team,
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToCase(caseData);
  }

  /**
   * Update case with audit trail
   */
  async update(
    caseId: string,
    params: UpdateCaseParams,
    updatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Case> {
    // Get current case state
    const currentCase = await this.getById(caseId);
    if (!currentCase) {
      throw new Error('Case not found');
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (params.status !== undefined) updatePayload.status = params.status;
    if (params.assigned_to_user_id !== undefined) updatePayload.assigned_to_user_id = params.assigned_to_user_id;
    if (params.owner_team !== undefined) updatePayload.owner_team = params.owner_team;
    if (params.escalation_level !== undefined) updatePayload.escalation_level = params.escalation_level;
    if (params.subject !== undefined) updatePayload.subject = params.subject;
    if (params.tags !== undefined) updatePayload.tags = params.tags;
    if (params.sla_due_at !== undefined) updatePayload.sla_due_at = params.sla_due_at;

    // Update case
    const { data: updatedCase, error } = await this.supabase
      .from('vmp_cases')
      .update(updatePayload)
      .eq('id', caseId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update case: ${error.message}`);
    }

    // Calculate changes
    const changes: Record<string, unknown> = {};
    if (params.status && params.status !== currentCase.status) {
      changes.status = { from: currentCase.status, to: params.status };
    }
    if (params.assigned_to_user_id !== undefined && params.assigned_to_user_id !== currentCase.assigned_to_user_id) {
      changes.assigned_to_user_id = { from: currentCase.assigned_to_user_id, to: params.assigned_to_user_id };
    }
    if (params.owner_team && params.owner_team !== currentCase.owner_team) {
      changes.owner_team = { from: currentCase.owner_team, to: params.owner_team };
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'case',
      entity_id: caseId,
      action: 'update',
      action_by: updatedBy,
      old_state: currentCase,
      new_state: updatedCase,
      changes,
      workflow_stage: updatedCase.status,
      workflow_state: {
        status: updatedCase.status,
        case_type: updatedCase.case_type,
        owner_team: updatedCase.owner_team,
        escalation_level: updatedCase.escalation_level,
      },
      tenant_id: currentCase.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToCase(updatedCase);
  }

  /**
   * Assign case to user/team with audit trail
   */
  async assign(
    caseId: string,
    assignedToUserId: string | null,
    ownerTeam: Case['owner_team'],
    assignedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Case> {
    return this.update(
      caseId,
      {
        assigned_to_user_id: assignedToUserId,
        owner_team: ownerTeam,
      },
      assignedBy,
      requestContext
    );
  }

  /**
   * Resolve case with audit trail
   */
  async resolve(
    caseId: string,
    resolvedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Case> {
    return this.update(
      caseId,
      { status: 'resolved' },
      resolvedBy,
      requestContext
    );
  }

  /**
   * Get case by ID
   */
  async getById(caseId: string): Promise<Case | null> {
    const { data, error } = await this.supabase
      .from('vmp_cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get case: ${error.message}`);
    }

    return this.mapRowToCase(data);
  }

  /**
   * List cases with filters
   */
  async list(filters?: CaseFilters): Promise<Case[]> {
    let query = this.supabase
      .from('vmp_cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.case_type) {
      query = query.eq('case_type', filters.case_type);
    }

    if (filters?.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id);
    }

    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    if (filters?.owner_team) {
      query = query.eq('owner_team', filters.owner_team);
    }

    if (filters?.assigned_to_user_id) {
      query = query.eq('assigned_to_user_id', filters.assigned_to_user_id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list cases: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToCase(row));
  }

  /**
   * Get audit trail for a case
   */
  async getAuditTrail(caseId: string) {
    return this.auditTrail.getByEntity('case', caseId);
  }

  /**
   * Map database row to Case
   */
  private mapRowToCase(row: unknown): Case {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      company_id: r.company_id as string,
      vendor_id: r.vendor_id as string,
      case_type: r.case_type as Case['case_type'],
      status: r.status as Case['status'],
      subject: r.subject as string,
      owner_team: r.owner_team as Case['owner_team'],
      sla_due_at: (r.sla_due_at as string) || null,
      escalation_level: (r.escalation_level as number) || 0,
      assigned_to_user_id: (r.assigned_to_user_id as string) || null,
      group_id: (r.group_id as string) || null,
      linked_invoice_id: (r.linked_invoice_id as string) || null,
      linked_po_id: (r.linked_po_id as string) || null,
      linked_grn_id: (r.linked_grn_id as string) || null,
      linked_payment_id: (r.linked_payment_id as string) || null,
      tags: (r.tags as string[]) || [],
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


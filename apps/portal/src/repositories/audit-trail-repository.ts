/**
 * Audit Trail Repository
 *
 * Manages cryptographic audit trail with immutable records.
 * Every action creates an audit record with cryptographic proof.
 */

import { createServiceClient } from '@/lib/supabase-client';

export interface AuditTrailRecord {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  action_by: string;
  action_at: string;
  old_state: Record<string, unknown> | null;
  new_state: Record<string, unknown> | null;
  changes: Record<string, unknown> | null;
  content_hash: string;
  previous_hash: string | null;
  proof_timestamp: string;
  workflow_stage: string | null;
  workflow_state: Record<string, unknown> | null;
  tenant_id: string;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  created_at: string;
}

export interface AuditTrailFilters {
  entity_type?: string;
  entity_id?: string;
  action?: string;
  action_by?: string;
  workflow_stage?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Helper type to convert any object to Record<string, unknown>
 * This allows type-safe objects to be passed to audit trail
 */
type AuditState = Record<string, unknown> | object | null | undefined;

export class AuditTrailRepository {
  private supabase = createServiceClient();

  /**
   * Convert any state object to Record<string, unknown> for storage
   */
  private toRecord(state: AuditState): Record<string, unknown> | null {
    if (state === null || state === undefined) return null;
    return JSON.parse(JSON.stringify(state)) as Record<string, unknown>;
  }

  /**
   * Insert audit trail record with cryptographic proof
   */
  async insert(
    params: {
      entity_type: string;
      entity_id: string;
      action: string;
      action_by: string;
      old_state?: AuditState;
      new_state?: AuditState;
      changes?: AuditState;
      workflow_stage?: string;
      workflow_state?: AuditState;
      tenant_id: string;
      ip_address?: string;
      user_agent?: string;
      request_id?: string;
    }
  ): Promise<AuditTrailRecord> {
    // Call PostgreSQL function to insert with cryptographic hash
    const { data, error } = await this.supabase.rpc('insert_audit_trail', {
      p_entity_type: params.entity_type,
      p_entity_id: params.entity_id,
      p_action: params.action,
      p_action_by: params.action_by,
      p_old_state: this.toRecord(params.old_state),
      p_new_state: this.toRecord(params.new_state),
      p_changes: this.toRecord(params.changes),
      p_workflow_stage: params.workflow_stage || null,
      p_workflow_state: this.toRecord(params.workflow_state),
      p_tenant_id: params.tenant_id,
      p_ip_address: params.ip_address || null,
      p_user_agent: params.user_agent || null,
      p_request_id: params.request_id || null,
    });

    if (error) {
      throw new Error(`Failed to insert audit trail: ${error.message}`);
    }

    // Fetch the inserted record
    const { data: record, error: fetchError } = await this.supabase
      .from('audit_trail')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch audit trail record: ${fetchError.message}`);
    }

    return this.mapRowToRecord(record);
  }

  /**
   * Get audit trail for an entity
   */
  async getByEntity(
    entity_type: string,
    entity_id: string
  ): Promise<AuditTrailRecord[]> {
    const { data, error } = await this.supabase
      .from('audit_trail')
      .select('*')
      .eq('entity_type', entity_type)
      .eq('entity_id', entity_id)
      .order('action_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get audit trail: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToRecord(row));
  }

  /**
   * Search audit trail with filters
   */
  async search(filters: AuditTrailFilters): Promise<AuditTrailRecord[]> {
    let query = this.supabase
      .from('audit_trail')
      .select('*')
      .order('action_at', { ascending: false });

    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }

    if (filters.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.action_by) {
      query = query.eq('action_by', filters.action_by);
    }

    if (filters.workflow_stage) {
      query = query.eq('workflow_stage', filters.workflow_stage);
    }

    if (filters.start_date) {
      query = query.gte('action_at', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('action_at', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search audit trail: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToRecord(row));
  }

  /**
   * Verify audit trail integrity (chain verification)
   */
  async verifyIntegrity(
    entity_type: string,
    entity_id: string
  ): Promise<{ valid: boolean; invalid_records: AuditTrailRecord[] }> {
    const records = await this.getByEntity(entity_type, entity_id);
    const invalidRecords: AuditTrailRecord[] = [];

    for (let i = 1; i < records.length; i++) {
      const current = records[i];
      const previous = records[i - 1];

      if (current.previous_hash !== previous.content_hash) {
        invalidRecords.push(current);
      }
    }

    return {
      valid: invalidRecords.length === 0,
      invalid_records: invalidRecords,
    };
  }

  /**
   * Map database row to AuditTrailRecord
   */
  private mapRowToRecord(row: unknown): AuditTrailRecord {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      entity_type: r.entity_type as string,
      entity_id: r.entity_id as string,
      action: r.action as string,
      action_by: r.action_by as string,
      action_at: r.action_at as string,
      old_state: (r.old_state as Record<string, unknown>) || null,
      new_state: (r.new_state as Record<string, unknown>) || null,
      changes: (r.changes as Record<string, unknown>) || null,
      content_hash: r.content_hash as string,
      previous_hash: (r.previous_hash as string) || null,
      proof_timestamp: r.proof_timestamp as string,
      workflow_stage: (r.workflow_stage as string) || null,
      workflow_state: (r.workflow_state as Record<string, unknown>) || null,
      tenant_id: r.tenant_id as string,
      ip_address: r.ip_address as string | undefined,
      user_agent: r.user_agent as string | undefined,
      request_id: r.request_id as string | undefined,
      created_at: r.created_at as string,
    };
  }
}


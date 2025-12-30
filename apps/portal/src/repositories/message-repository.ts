/**
 * Message Repository with Audit Trail
 * 
 * Manages multi-team collaboration messages with automatic audit trail logging.
 * Every message creates an immutable audit record.
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface Message {
  id: string;
  case_id: string;
  channel_source: 'portal' | 'whatsapp' | 'email' | 'slack';
  sender_type: 'vendor' | 'internal' | 'ai';
  sender_user_id: string | null;
  body: string;
  is_internal_note: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
}

export interface CreateMessageParams {
  case_id: string;
  channel_source: Message['channel_source'];
  sender_type: Message['sender_type'];
  sender_user_id: string | null;
  body: string;
  is_internal_note?: boolean;
  metadata?: Record<string, unknown>;
}

export class MessageRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Create message with audit trail
   */
  async create(
    params: CreateMessageParams,
    tenantId: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Message> {
    // Insert message
    const { data: messageData, error } = await this.supabase
      .from('vmp_messages')
      .insert({
        case_id: params.case_id,
        channel_source: params.channel_source,
        sender_type: params.sender_type,
        sender_user_id: params.sender_user_id,
        body: params.body,
        is_internal_note: params.is_internal_note || false,
        metadata: params.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'message',
      entity_id: messageData.id,
      action: 'create',
      action_by: params.sender_user_id || 'system',
      new_state: messageData,
      workflow_stage: params.is_internal_note ? 'internal_note' : 'message',
      workflow_state: {
        case_id: params.case_id,
        sender_type: params.sender_type,
        channel_source: params.channel_source,
        is_internal_note: params.is_internal_note || false,
      },
      tenant_id: tenantId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    // Also create audit record for the case (message added)
    await this.auditTrail.insert({
      entity_type: 'case',
      entity_id: params.case_id,
      action: 'message_added',
      action_by: params.sender_user_id || 'system',
      new_state: {
        message_id: messageData.id,
        message_type: params.is_internal_note ? 'internal_note' : 'message',
        sender_type: params.sender_type,
      },
      workflow_stage: 'in_progress',
      workflow_state: {
        last_message_at: messageData.created_at,
        last_message_by: params.sender_user_id,
      },
      tenant_id: tenantId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToMessage(messageData);
  }

  /**
   * Get messages for a case
   */
  async getByCase(caseId: string, includeInternal: boolean = false): Promise<Message[]> {
    let query = this.supabase
      .from('vmp_messages')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });

    if (!includeInternal) {
      query = query.eq('is_internal_note', false);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToMessage(row));
  }

  /**
   * Get message by ID
   */
  async getById(messageId: string): Promise<Message | null> {
    const { data, error } = await this.supabase
      .from('vmp_messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get message: ${error.message}`);
    }

    return this.mapRowToMessage(data);
  }

  /**
   * Get audit trail for a message
   */
  async getAuditTrail(messageId: string) {
    return this.auditTrail.getByEntity('message', messageId);
  }

  /**
   * Map database row to Message
   */
  private mapRowToMessage(row: unknown): Message {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      case_id: r.case_id as string,
      channel_source: r.channel_source as Message['channel_source'],
      sender_type: r.sender_type as Message['sender_type'],
      sender_user_id: (r.sender_user_id as string) || null,
      body: r.body as string,
      is_internal_note: (r.is_internal_note as boolean) || false,
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      updated_at: (r.updated_at as string) || null,
    };
  }
}


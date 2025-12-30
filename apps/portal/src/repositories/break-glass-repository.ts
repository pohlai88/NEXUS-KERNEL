/**
 * Break Glass Escalation Repository
 * 
 * SOS feature: Vendor can escalate directly to Senior Manager/Boss when stuck.
 * "I cannot find anyone in the company" → Break Glass → Senior Manager notified.
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';
import { NotificationRepository } from './notification-repository';

export interface BreakGlassEscalation {
    id: string;
    tenant_id: string;
    escalation_type: 'sla_breach' | 'no_response' | 'staff_difficulty' | 'urgent_issue' | 'other';
    priority: 'high' | 'critical' | 'emergency';
    case_id: string | null;
    invoice_id: string | null;
    vendor_id: string;
    reason: string;
    description: string;
    evidence: Record<string, unknown>;
    escalated_to_user_id: string;
    escalated_by_vendor_id: string;
    status: 'pending' | 'acknowledged' | 'resolved' | 'dismissed';
    resolved_at: string | null;
    resolved_by: string | null;
    resolution_notes: string | null;
    original_sla_deadline: string | null;
    sla_breach_reason: string | null;
    created_at: string;
    acknowledged_at: string | null;
    acknowledged_by: string | null;
}

export interface CreateEscalationParams {
    tenant_id: string;
    escalation_type: BreakGlassEscalation['escalation_type'];
    priority?: BreakGlassEscalation['priority'];
    case_id?: string;
    invoice_id?: string;
    vendor_id: string;
    reason: string;
    description: string;
    evidence?: Record<string, unknown>;
    original_sla_deadline?: string;
    sla_breach_reason?: string;
}

export class BreakGlassRepository {
    private supabase = createClient();
    private auditTrail = new AuditTrailRepository();
    private notificationRepo = new NotificationRepository();

    /**
     * Create Break Glass escalation (SOS)
     */
    async escalate(
        params: CreateEscalationParams,
        requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
    ): Promise<BreakGlassEscalation> {
        // Get Senior Manager/Boss (highest role in tenant)
        const seniorManager = await this.getSeniorManager(params.tenant_id);
        if (!seniorManager) {
            throw new Error('No Senior Manager found. Cannot escalate.');
        }

        // Create escalation
        const { data: escalationData, error } = await this.supabase
            .from('break_glass_escalations')
            .insert({
                tenant_id: params.tenant_id,
                escalation_type: params.escalation_type,
                priority: params.priority || 'critical',
                case_id: params.case_id || null,
                invoice_id: params.invoice_id || null,
                vendor_id: params.vendor_id,
                reason: params.reason,
                description: params.description,
                evidence: params.evidence || {},
                escalated_to_user_id: seniorManager.id,
                escalated_by_vendor_id: params.vendor_id,
                original_sla_deadline: params.original_sla_deadline || null,
                sla_breach_reason: params.sla_breach_reason || null,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to create escalation: ${error.message}`);
        }

        // Send urgent notification to Senior Manager
        await this.notificationRepo.create(
            {
                tenant_id: params.tenant_id,
                recipient_type: 'internal',
                recipient_user_id: seniorManager.id,
                notification_type: 'break_glass_escalation',
                title: `🚨 BREAK GLASS: ${params.reason}`,
                message: `Vendor has escalated: ${params.description}`,
                related_entity_type: 'escalation',
                related_entity_id: escalationData.id,
                priority: 'urgent',
                metadata: {
                    escalation_type: params.escalation_type,
                    vendor_id: params.vendor_id,
                },
            },
            requestContext
        );

        // Create audit trail record
        await this.auditTrail.insert({
            entity_type: 'break_glass_escalation',
            entity_id: escalationData.id,
            action: 'escalate',
            action_by: params.vendor_id,
            new_state: JSON.parse(JSON.stringify(escalationData)) as Record<string, unknown>,
            workflow_stage: 'pending',
            workflow_state: {
                escalation_type: params.escalation_type,
                priority: params.priority || 'critical',
                escalated_to: seniorManager.id,
            },
            tenant_id: params.tenant_id,
            ip_address: requestContext?.ip_address,
            user_agent: requestContext?.user_agent,
            request_id: requestContext?.request_id,
        });

        // Also create audit record for related case/invoice
        if (params.case_id) {
            await this.auditTrail.insert({
                entity_type: 'case',
                entity_id: params.case_id,
                action: 'break_glass_escalated',
                action_by: params.vendor_id,
                new_state: { escalation_id: escalationData.id },
                workflow_stage: 'escalated',
                workflow_state: {
                    escalated_to: seniorManager.id,
                    escalation_reason: params.reason,
                },
                tenant_id: params.tenant_id,
            });
        }

        return this.mapRowToEscalation(escalationData);
    }

    /**
     * Acknowledge escalation (Senior Manager)
     */
    async acknowledge(
        escalationId: string,
        acknowledgedBy: string,
        requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
    ): Promise<BreakGlassEscalation> {
        const escalation = await this.getById(escalationId);
        if (!escalation) {
            throw new Error('Escalation not found');
        }

        const { data: updatedEscalation, error } = await this.supabase
            .from('break_glass_escalations')
            .update({
                status: 'acknowledged',
                acknowledged_at: new Date().toISOString(),
                acknowledged_by: acknowledgedBy,
            })
            .eq('id', escalationId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to acknowledge escalation: ${error.message}`);
        }

        // Notify vendor that escalation was acknowledged
        await this.notificationRepo.create(
            {
                tenant_id: escalation.tenant_id,
                recipient_type: 'vendor',
                recipient_vendor_id: escalation.vendor_id,
                notification_type: 'escalation_acknowledged',
                title: 'Escalation Acknowledged',
                message: `Your escalation has been acknowledged by Senior Management. They are reviewing your case.`,
                related_entity_type: 'escalation',
                related_entity_id: escalationId,
                priority: 'high',
            },
            requestContext
        );

        // Create audit trail record
        await this.auditTrail.insert({
            entity_type: 'break_glass_escalation',
            entity_id: escalationId,
            action: 'acknowledge',
            action_by: acknowledgedBy,
            old_state: JSON.parse(JSON.stringify(escalation)) as Record<string, unknown>,
            new_state: JSON.parse(JSON.stringify(updatedEscalation)) as Record<string, unknown>,
            workflow_stage: 'acknowledged',
            workflow_state: {
                acknowledged_by: acknowledgedBy,
            },
            tenant_id: escalation.tenant_id,
            ip_address: requestContext?.ip_address,
            user_agent: requestContext?.user_agent,
            request_id: requestContext?.request_id,
        });

        return this.mapRowToEscalation(updatedEscalation);
    }

    /**
     * Resolve escalation
     */
    async resolve(
        escalationId: string,
        resolvedBy: string,
        resolutionNotes: string,
        requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
    ): Promise<BreakGlassEscalation> {
        const escalation = await this.getById(escalationId);
        if (!escalation) {
            throw new Error('Escalation not found');
        }

        const { data: updatedEscalation, error } = await this.supabase
            .from('break_glass_escalations')
            .update({
                status: 'resolved',
                resolved_at: new Date().toISOString(),
                resolved_by: resolvedBy,
                resolution_notes: resolutionNotes,
            })
            .eq('id', escalationId)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to resolve escalation: ${error.message}`);
        }

        // Notify vendor that escalation was resolved
        await this.notificationRepo.create(
            {
                tenant_id: escalation.tenant_id,
                recipient_type: 'vendor',
                recipient_vendor_id: escalation.vendor_id,
                notification_type: 'escalation_resolved',
                title: 'Escalation Resolved',
                message: `Your escalation has been resolved. ${resolutionNotes}`,
                related_entity_type: 'escalation',
                related_entity_id: escalationId,
                priority: 'normal',
            },
            requestContext
        );

        // Create audit trail record
        await this.auditTrail.insert({
            entity_type: 'break_glass_escalation',
            entity_id: escalationId,
            action: 'resolve',
            action_by: resolvedBy,
            old_state: JSON.parse(JSON.stringify(escalation)) as Record<string, unknown>,
            new_state: JSON.parse(JSON.stringify(updatedEscalation)) as Record<string, unknown>,
            workflow_stage: 'resolved',
            workflow_state: {
                resolved_by: resolvedBy,
                resolution_notes: resolutionNotes,
            },
            tenant_id: escalation.tenant_id,
            ip_address: requestContext?.ip_address,
            user_agent: requestContext?.user_agent,
            request_id: requestContext?.request_id,
        });

        return this.mapRowToEscalation(updatedEscalation);
    }

    /**
     * Get escalation by ID
     */
    async getById(escalationId: string): Promise<BreakGlassEscalation | null> {
        const { data, error } = await this.supabase
            .from('break_glass_escalations')
            .select('*')
            .eq('id', escalationId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw new Error(`Failed to get escalation: ${error.message}`);
        }

        return this.mapRowToEscalation(data);
    }

    /**
     * Get escalations for vendor
     */
    async getByVendor(vendorId: string): Promise<BreakGlassEscalation[]> {
        const { data, error } = await this.supabase
            .from('break_glass_escalations')
            .select('*')
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to get escalations: ${error.message}`);
        }

        return (data || []).map((row) => this.mapRowToEscalation(row));
    }

    /**
     * Get escalations for Senior Manager
     */
    async getBySeniorManager(userId: string): Promise<BreakGlassEscalation[]> {
        const { data, error } = await this.supabase
            .from('break_glass_escalations')
            .select('*')
            .eq('escalated_to_user_id', userId)
            .in('status', ['pending', 'acknowledged'])
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Failed to get escalations: ${error.message}`);
        }

        return (data || []).map((row) => this.mapRowToEscalation(row));
    }

    /**
     * Get Senior Manager (highest role in tenant)
     */
    private async getSeniorManager(tenantId: string): Promise<{ id: string; name: string } | null> {
        // Get user with highest role (Senior Manager, Director, etc.)
        const { data, error } = await this.supabase
            .from('users')
            .select('id, name')
            .eq('tenant_id', tenantId)
            .in('role', ['senior_manager', 'director', 'ceo', 'admin'])
            .order('role', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            // Fallback: Get any admin user
            const { data: adminData } = await this.supabase
                .from('users')
                .select('id, name')
                .eq('tenant_id', tenantId)
                .eq('role', 'admin')
                .limit(1)
                .single();

            return adminData ? { id: adminData.id, name: adminData.name } : null;
        }

        return data ? { id: data.id, name: data.name } : null;
    }

    /**
     * Map database row to BreakGlassEscalation
     */
    private mapRowToEscalation(row: unknown): BreakGlassEscalation {
        const r = row as Record<string, unknown>;
        return {
            id: r.id as string,
            tenant_id: r.tenant_id as string,
            escalation_type: r.escalation_type as BreakGlassEscalation['escalation_type'],
            priority: r.priority as BreakGlassEscalation['priority'],
            case_id: (r.case_id as string) || null,
            invoice_id: (r.invoice_id as string) || null,
            vendor_id: r.vendor_id as string,
            reason: r.reason as string,
            description: r.description as string,
            evidence: (r.evidence as Record<string, unknown>) || {},
            escalated_to_user_id: r.escalated_to_user_id as string,
            escalated_by_vendor_id: r.escalated_by_vendor_id as string,
            status: r.status as BreakGlassEscalation['status'],
            resolved_at: (r.resolved_at as string) || null,
            resolved_by: (r.resolved_by as string) || null,
            resolution_notes: (r.resolution_notes as string) || null,
            original_sla_deadline: (r.original_sla_deadline as string) || null,
            sla_breach_reason: (r.sla_breach_reason as string) || null,
            created_at: r.created_at as string,
            acknowledged_at: (r.acknowledged_at as string) || null,
            acknowledged_by: (r.acknowledged_by as string) || null,
        };
    }
}


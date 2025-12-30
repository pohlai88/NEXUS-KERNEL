/**
 * Centralized Credit & Risk Management Repository
 * 
 * Group Shield: Risk as Group Asset, not local secret.
 * Prevents "Domino Effect" - one weak vendor cannot accumulate massive liability.
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface GroupRiskWatchlist {
  id: string;
  group_id: string;
  global_vendor_id: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_reason: string;
  flagged_by: string;
  flagged_at: string;
  requires_group_cfo_approval: boolean;
  requires_group_ceo_approval: boolean;
  status: 'active' | 'resolved' | 'dismissed';
  resolved_at: string | null;
  resolved_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface GroupCreditExposure {
  id: string;
  group_id: string;
  global_vendor_id: string;
  total_open_pos: number;
  total_open_invoices: number;
  total_exposure: number;
  credit_limit: number | null;
  available_credit: number | null;
  is_over_limit: boolean;
  last_calculated_at: string;
}

export interface RiskCheckResult {
  is_on_watchlist: boolean;
  risk_level: GroupRiskWatchlist['risk_level'] | null;
  risk_reason: string | null;
  exceeds_credit_limit: boolean;
  current_exposure: number;
  credit_limit: number | null;
  available_credit: number | null;
  requires_approval: boolean;
  approval_required_by: string | null; // 'group_cfo', 'group_ceo'
}

export class RiskManagementRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Add vendor to risk watchlist
   */
  async addToWatchlist(
    groupId: string,
    globalVendorId: string,
    riskLevel: GroupRiskWatchlist['risk_level'],
    riskReason: string,
    flaggedBy: string,
    requiresCFOApproval: boolean = false,
    requiresCEOApproval: boolean = false,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<GroupRiskWatchlist> {
    const { data: watchlistData, error } = await this.supabase
      .from('group_risk_watchlist')
      .insert({
        group_id: groupId,
        global_vendor_id: globalVendorId,
        risk_level: riskLevel,
        risk_reason: riskReason,
        flagged_by: flaggedBy,
        requires_group_cfo_approval: requiresCFOApproval,
        requires_group_ceo_approval: requiresCEOApproval,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add to watchlist: ${error.message}`);
    }

    // Update global vendor risk status
    await this.supabase
      .from('global_vendors')
      .update({
        risk_status: riskLevel === 'CRITICAL' ? 'RED' : riskLevel === 'HIGH' ? 'YELLOW' : 'GREEN',
        updated_at: new Date().toISOString(),
      })
      .eq('id', globalVendorId);

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'group_risk_watchlist',
      entity_id: watchlistData.id,
      action: 'add_to_watchlist',
      action_by: flaggedBy,
      new_state: watchlistData,
      workflow_stage: 'active',
      workflow_state: {
        risk_level: riskLevel,
        risk_reason: riskReason,
        requires_cfo_approval: requiresCFOApproval,
        requires_ceo_approval: requiresCEOApproval,
      },
      tenant_id: groupId,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToWatchlist(watchlistData);
  }

  /**
   * Check risk before creating PO/invoice
   */
  async checkRisk(
    globalVendorId: string,
    additionalAmount: number = 0
  ): Promise<RiskCheckResult> {
    // Check if on watchlist
    const { data: watchlist } = await this.supabase
      .from('group_risk_watchlist')
      .select('*')
      .eq('global_vendor_id', globalVendorId)
      .eq('status', 'active')
      .order('risk_level', { ascending: false })
      .limit(1)
      .single();

    // Get credit exposure
    const { data: exposure } = await this.supabase
      .from('group_credit_exposure')
      .select('*')
      .eq('global_vendor_id', globalVendorId)
      .single();

    const isOnWatchlist = !!watchlist;
    const riskLevel = watchlist?.risk_level || null;
    const riskReason = watchlist?.risk_reason || null;

    const currentExposure = exposure?.total_exposure || 0;
    const creditLimit = exposure?.credit_limit || null;
    const availableCredit = creditLimit ? creditLimit - currentExposure : null;
    const exceedsCreditLimit = creditLimit ? (currentExposure + additionalAmount) > creditLimit : false;

    // Determine if approval required
    let requiresApproval = false;
    let approvalRequiredBy: string | null = null;

    if (isOnWatchlist) {
      if (watchlist.requires_group_ceo_approval) {
        requiresApproval = true;
        approvalRequiredBy = 'group_ceo';
      } else if (watchlist.requires_group_cfo_approval) {
        requiresApproval = true;
        approvalRequiredBy = 'group_cfo';
      } else if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
        requiresApproval = true;
        approvalRequiredBy = 'group_cfo';
      }
    }

    if (exceedsCreditLimit) {
      requiresApproval = true;
      if (!approvalRequiredBy) {
        approvalRequiredBy = 'group_cfo';
      }
    }

    return {
      is_on_watchlist: isOnWatchlist,
      risk_level: riskLevel,
      risk_reason: riskReason,
      exceeds_credit_limit: exceedsCreditLimit,
      current_exposure: currentExposure,
      credit_limit: creditLimit,
      available_credit: availableCredit,
      requires_approval: requiresApproval,
      approval_required_by: approvalRequiredBy,
    };
  }

  /**
   * Recalculate credit exposure for vendor
   */
  async recalculateExposure(
    groupId: string,
    globalVendorId: string
  ): Promise<GroupCreditExposure> {
    // Call PostgreSQL function
    const { error } = await this.supabase.rpc('calculate_group_credit_exposure', {
      p_group_id: groupId,
      p_global_vendor_id: globalVendorId,
    });

    if (error) {
      throw new Error(`Failed to recalculate exposure: ${error.message}`);
    }

    // Get updated exposure
    const { data: exposure, error: fetchError } = await this.supabase
      .from('group_credit_exposure')
      .select('*')
      .eq('group_id', groupId)
      .eq('global_vendor_id', globalVendorId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to get exposure: ${fetchError.message}`);
    }

    return this.mapRowToExposure(exposure);
  }

  /**
   * Get watchlist for group
   */
  async getWatchlist(
    groupId: string,
    status?: GroupRiskWatchlist['status']
  ): Promise<GroupRiskWatchlist[]> {
    let query = this.supabase
      .from('group_risk_watchlist')
      .select('*')
      .eq('group_id', groupId)
      .order('risk_level', { ascending: false })
      .order('flagged_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get watchlist: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToWatchlist(row));
  }

  /**
   * Map database row to GroupRiskWatchlist
   */
  private mapRowToWatchlist(row: unknown): GroupRiskWatchlist {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      group_id: r.group_id as string,
      global_vendor_id: r.global_vendor_id as string,
      risk_level: r.risk_level as GroupRiskWatchlist['risk_level'],
      risk_reason: r.risk_reason as string,
      flagged_by: r.flagged_by as string,
      flagged_at: r.flagged_at as string,
      requires_group_cfo_approval: (r.requires_group_cfo_approval as boolean) || false,
      requires_group_ceo_approval: (r.requires_group_ceo_approval as boolean) || false,
      status: r.status as GroupRiskWatchlist['status'],
      resolved_at: (r.resolved_at as string) || null,
      resolved_by: (r.resolved_by as string) || null,
      metadata: (r.metadata as Record<string, unknown>) || {},
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }

  /**
   * Map database row to GroupCreditExposure
   */
  private mapRowToExposure(row: unknown): GroupCreditExposure {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      group_id: r.group_id as string,
      global_vendor_id: r.global_vendor_id as string,
      total_open_pos: parseFloat((r.total_open_pos as number || 0).toString()),
      total_open_invoices: parseFloat((r.total_open_invoices as number || 0).toString()),
      total_exposure: parseFloat((r.total_exposure as number || 0).toString()),
      credit_limit: (r.credit_limit as number) || null,
      available_credit: (r.available_credit as number) || null,
      is_over_limit: (r.is_over_limit as boolean) || false,
      last_calculated_at: r.last_calculated_at as string,
    };
  }
}


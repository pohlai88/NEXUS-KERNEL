/**
 * Three-Way Matching Repository with Audit Trail
 * 
 * Manages PO-GRN-Invoice matching with automatic audit trail logging.
 * Every matching operation creates an immutable audit record.
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface ThreeWayMatch {
  id: string;
  tenant_id: string;
  purchase_order_id: string;
  goods_receipt_note_id: string;
  invoice_id: string;
  matching_status: 'pending' | 'matched' | 'partial' | 'mismatch' | 'disputed';
  matching_score: number | null; // 0-100
  po_amount: number | null;
  grn_amount: number | null;
  invoice_amount: number | null;
  variance_amount: number | null;
  line_items: unknown[] | null; // JSONB array of matched line items
  approved_by: string | null;
  approved_at: string | null;
  approval_status: 'pending' | 'approved' | 'rejected' | null;
  payment_preview_id: string | null;
  payment_eligible: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchDocumentsParams {
  purchase_order_id: string;
  goods_receipt_note_id: string;
  invoice_id: string;
  tenant_id: string;
}

export interface MatchResult {
  match: ThreeWayMatch;
  matching_score: number;
  variance_amount: number;
  line_items_matched: number;
  line_items_total: number;
}

export class ThreeWayMatchingRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Perform 3-way matching with audit trail
   */
  async matchDocuments(
    params: MatchDocumentsParams,
    matchedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<MatchResult> {
    // Fetch PO, GRN, Invoice
    const [po, grn, invoice] = await Promise.all([
      this.getPO(params.purchase_order_id),
      this.getGRN(params.goods_receipt_note_id),
      this.getInvoice(params.invoice_id),
    ]);

    if (!po || !grn || !invoice) {
      throw new Error('One or more documents not found');
    }

    // Calculate matching
    const poAmount = parseFloat(po.total_amount?.toString() || '0');
    const grnAmount = parseFloat(grn.total_amount?.toString() || '0');
    const invoiceAmount = parseFloat(invoice.amount?.toString() || '0');

    const varianceAmount = invoiceAmount - poAmount;
    const matchingScore = this.calculateMatchingScore(poAmount, grnAmount, invoiceAmount);

    // Determine matching status
    let matchingStatus: ThreeWayMatch['matching_status'] = 'pending';
    if (matchingScore >= 95) {
      matchingStatus = 'matched';
    } else if (matchingScore >= 80) {
      matchingStatus = 'partial';
    } else if (matchingScore < 80) {
      matchingStatus = 'mismatch';
    }

    // Create or update match record
    const existingMatch = await this.findExistingMatch(
      params.purchase_order_id,
      params.goods_receipt_note_id,
      params.invoice_id
    );

    let match: ThreeWayMatch;
    if (existingMatch) {
      // Update existing match
      const { data: updatedMatch, error } = await this.supabase
        .from('three_way_matching')
        .update({
          matching_status: matchingStatus,
          matching_score: matchingScore,
          po_amount: poAmount,
          grn_amount: grnAmount,
          invoice_amount: invoiceAmount,
          variance_amount: varianceAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingMatch.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update match: ${error.message}`);
      match = this.mapRowToMatch(updatedMatch);
    } else {
      // Create new match
      const { data: newMatch, error } = await this.supabase
        .from('three_way_matching')
        .insert({
          tenant_id: params.tenant_id,
          purchase_order_id: params.purchase_order_id,
          goods_receipt_note_id: params.goods_receipt_note_id,
          invoice_id: params.invoice_id,
          matching_status: matchingStatus,
          matching_score: matchingScore,
          po_amount: poAmount,
          grn_amount: grnAmount,
          invoice_amount: invoiceAmount,
          variance_amount: varianceAmount,
          approval_status: 'pending',
          payment_eligible: matchingStatus === 'matched',
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create match: ${error.message}`);
      match = this.mapRowToMatch(newMatch);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'three_way_match',
      entity_id: match.id,
      action: existingMatch ? 'update_match' : 'create_match',
      action_by: matchedBy,
      old_state: existingMatch ? existingMatch : null,
      new_state: match,
      changes: existingMatch ? {
        matching_status: { from: existingMatch.matching_status, to: matchingStatus },
        matching_score: { from: existingMatch.matching_score, to: matchingScore },
      } : null,
      workflow_stage: matchingStatus,
      workflow_state: {
        matching_score: matchingScore,
        variance_amount: varianceAmount,
        po_amount: poAmount,
        grn_amount: grnAmount,
        invoice_amount: invoiceAmount,
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    // Also create audit records for individual documents
    await Promise.all([
      this.auditTrail.insert({
        entity_type: 'invoice',
        entity_id: params.invoice_id,
        action: 'match',
        action_by: matchedBy,
        new_state: { matching_status: matchingStatus, matching_score: matchingScore },
        workflow_stage: matchingStatus,
        workflow_state: { match_id: match.id },
        tenant_id: params.tenant_id,
      }),
      this.auditTrail.insert({
        entity_type: 'purchase_order',
        entity_id: params.purchase_order_id,
        action: 'match',
        action_by: matchedBy,
        new_state: { matching_status: matchingStatus, matching_score: matchingScore },
        workflow_stage: matchingStatus,
        workflow_state: { match_id: match.id },
        tenant_id: params.tenant_id,
      }),
      this.auditTrail.insert({
        entity_type: 'goods_receipt_note',
        entity_id: params.goods_receipt_note_id,
        action: 'match',
        action_by: matchedBy,
        new_state: { matching_status: matchingStatus, matching_score: matchingScore },
        workflow_stage: matchingStatus,
        workflow_state: { match_id: match.id },
        tenant_id: params.tenant_id,
      }),
    ]);

    return {
      match,
      matching_score: matchingScore,
      variance_amount: varianceAmount,
      line_items_matched: 0, // TODO: Calculate from line_items
      line_items_total: 0, // TODO: Calculate from line_items
    };
  }

  /**
   * Approve match with audit trail
   */
  async approveMatch(
    matchId: string,
    approvedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<ThreeWayMatch> {
    const match = await this.getById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    const { data: updatedMatch, error } = await this.supabase
      .from('three_way_matching')
      .update({
        approval_status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve match: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'three_way_match',
      entity_id: matchId,
      action: 'approve',
      action_by: approvedBy,
      old_state: match,
      new_state: updatedMatch,
      changes: {
        approval_status: { from: match.approval_status, to: 'approved' },
      },
      workflow_stage: 'approved',
      workflow_state: {
        matching_score: match.matching_score,
        approved_by: approvedBy,
      },
      tenant_id: match.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToMatch(updatedMatch);
  }

  /**
   * Get match by ID
   */
  async getById(matchId: string): Promise<ThreeWayMatch | null> {
    const { data, error } = await this.supabase
      .from('three_way_matching')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get match: ${error.message}`);
    }

    return this.mapRowToMatch(data);
  }

  /**
   * Get matches for invoice
   */
  async getByInvoice(invoiceId: string): Promise<ThreeWayMatch[]> {
    const { data, error } = await this.supabase
      .from('three_way_matching')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get matches: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToMatch(row));
  }

  /**
   * Get audit trail for a match
   */
  async getAuditTrail(matchId: string) {
    return this.auditTrail.getByEntity('three_way_match', matchId);
  }

  /**
   * Calculate matching score (0-100)
   */
  private calculateMatchingScore(poAmount: number, grnAmount: number, invoiceAmount: number): number {
    // Simple scoring: perfect match = 100, variance reduces score
    const maxAmount = Math.max(poAmount, grnAmount, invoiceAmount);
    if (maxAmount === 0) return 0;

    const variance = Math.abs(invoiceAmount - poAmount);
    const variancePercent = (variance / maxAmount) * 100;

    // Score decreases with variance
    return Math.max(0, 100 - variancePercent);
  }

  /**
   * Find existing match
   */
  private async findExistingMatch(poId: string, grnId: string, invoiceId: string): Promise<ThreeWayMatch | null> {
    const { data, error } = await this.supabase
      .from('three_way_matching')
      .select('*')
      .eq('purchase_order_id', poId)
      .eq('goods_receipt_note_id', grnId)
      .eq('invoice_id', invoiceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find match: ${error.message}`);
    }

    return this.mapRowToMatch(data);
  }

  /**
   * Get PO
   */
  private async getPO(poId: string) {
    const { data, error } = await this.supabase
      .from('vmp_po_refs')
      .select('*')
      .eq('id', poId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get PO: ${error.message}`);
    }

    return data;
  }

  /**
   * Get GRN
   */
  private async getGRN(grnId: string) {
    const { data, error } = await this.supabase
      .from('vmp_grn_refs')
      .select('*')
      .eq('id', grnId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get GRN: ${error.message}`);
    }

    return data;
  }

  /**
   * Get Invoice
   */
  private async getInvoice(invoiceId: string) {
    const { data, error } = await this.supabase
      .from('vmp_invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to get invoice: ${error.message}`);
    }

    return data;
  }

  /**
   * Map database row to ThreeWayMatch
   */
  private mapRowToMatch(row: unknown): ThreeWayMatch {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      purchase_order_id: r.purchase_order_id as string,
      goods_receipt_note_id: r.goods_receipt_note_id as string,
      invoice_id: r.invoice_id as string,
      matching_status: r.matching_status as ThreeWayMatch['matching_status'],
      matching_score: (r.matching_score as number) || null,
      po_amount: (r.po_amount as number) || null,
      grn_amount: (r.grn_amount as number) || null,
      invoice_amount: (r.invoice_amount as number) || null,
      variance_amount: (r.variance_amount as number) || null,
      line_items: (r.line_items as unknown[]) || null,
      approved_by: (r.approved_by as string) || null,
      approved_at: (r.approved_at as string) || null,
      approval_status: (r.approval_status as ThreeWayMatch['approval_status']) || null,
      payment_preview_id: (r.payment_preview_id as string) || null,
      payment_eligible: (r.payment_eligible as boolean) || false,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


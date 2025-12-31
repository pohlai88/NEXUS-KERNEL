/**
 * SOA Auto-Matching Repository with Audit Trail
 * 
 * Manages Statement of Account auto-matching with automatic audit trail logging.
 * Every matching operation creates an immutable audit record.
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface SOAMatch {
  id: string;
  tenant_id: string;
  soa_document_id: string;
  soa_period_start: string;
  soa_period_end: string;
  matched_invoices: string[]; // Array of matched invoice IDs
  matched_payments: string[]; // Array of matched payment IDs
  unmatched_items: unknown[]; // Items that couldn't be matched
  matching_status: 'pending' | 'matched' | 'partial' | 'disputed';
  matching_score: number | null; // 0-100
  opening_balance: number | null;
  closing_balance: number | null;
  variance: number | null;
  matched_by: string | null;
  matched_at: string;
  created_at: string;
}

export interface SOAItem {
  id: string;
  case_id: string;
  vendor_id: string;
  company_id: string;
  line_number: number | null;
  invoice_number: string | null;
  invoice_date: string | null;
  amount: number;
  currency_code: string;
  description: string | null;
  reference_number: string | null;
  status: 'extracted' | 'matched' | 'discrepancy' | 'resolved' | 'ignored';
}

export interface AutoMatchSOAParams {
  soa_document_id: string;
  soa_period_start: string;
  soa_period_end: string;
  tenant_id: string;
  vendor_id: string;
  company_id: string;
}

export interface AutoMatchResult {
  match: SOAMatch;
  matching_score: number;
  matched_count: number;
  unmatched_count: number;
  variance: number;
}

export class SOAMatchingRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Auto-match SOA items with invoices and payments
   */
  async autoMatch(
    params: AutoMatchSOAParams,
    matchedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<AutoMatchResult> {
    // Get SOA items for this case/document
    const soaItems = await this.getSOAItems(params.soa_document_id);
    if (soaItems.length === 0) {
      throw new Error('No SOA items found');
    }

    // Get invoices and payments for matching
    const invoices = await this.getInvoices(params.vendor_id, params.company_id);
    const payments = await this.getPayments(params.vendor_id, params.company_id);

    // Perform matching
    const matchedInvoices: string[] = [];
    const matchedPayments: string[] = [];
    const unmatchedItems: unknown[] = [];

    for (const item of soaItems) {
      // Try to match with invoice
      const invoiceMatch = this.findInvoiceMatch(item, invoices);
      if (invoiceMatch) {
        matchedInvoices.push(invoiceMatch.id);
        // Update SOA item status
        await this.updateSOAItemStatus(item.id, 'matched');
        // Create match record
        await this.createSOAMatchRecord(item.id, invoiceMatch.id, 'deterministic', 1.0);
      } else {
        // Try to match with payment
        const paymentMatch = this.findPaymentMatch(item, payments);
        if (paymentMatch) {
          matchedPayments.push(paymentMatch.id);
          await this.updateSOAItemStatus(item.id, 'matched');
        } else {
          unmatchedItems.push(item);
          await this.updateSOAItemStatus(item.id, 'discrepancy');
        }
      }
    }

    // Calculate matching score
    const totalItems = soaItems.length;
    const matchedCount = matchedInvoices.length + matchedPayments.length;
    const matchingScore = totalItems > 0 ? (matchedCount / totalItems) * 100 : 0;

    // Determine matching status
    let matchingStatus: SOAMatch['matching_status'] = 'pending';
    if (matchingScore >= 95) {
      matchingStatus = 'matched';
    } else if (matchingScore >= 50) {
      matchingStatus = 'partial';
    } else {
      matchingStatus = 'disputed';
    }

    // Calculate balances and variance
    const totalAmount = soaItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
    const matchedAmount = matchedInvoices.length > 0
      ? invoices
          .filter((inv) => matchedInvoices.includes(inv.id))
          .reduce((sum, inv) => sum + parseFloat(inv.amount?.toString() || '0'), 0)
      : 0;
    const variance = totalAmount - matchedAmount;

    // Create or update SOA match record
    const existingMatch = await this.findExistingMatch(params.soa_document_id);
    let match: SOAMatch;

    if (existingMatch) {
      const { data: updatedMatch, error } = await this.supabase
        .from('soa_auto_matching')
        .update({
          matched_invoices: matchedInvoices,
          matched_payments: matchedPayments,
          unmatched_items: unmatchedItems,
          matching_status: matchingStatus,
          matching_score: matchingScore,
          variance: variance,
          matched_by: matchedBy,
          matched_at: new Date().toISOString(),
        })
        .eq('id', existingMatch.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update SOA match: ${error.message}`);
      match = this.mapRowToMatch(updatedMatch);
    } else {
      const { data: newMatch, error } = await this.supabase
        .from('soa_auto_matching')
        .insert({
          tenant_id: params.tenant_id,
          soa_document_id: params.soa_document_id,
          soa_period_start: params.soa_period_start,
          soa_period_end: params.soa_period_end,
          matched_invoices: matchedInvoices,
          matched_payments: matchedPayments,
          unmatched_items: unmatchedItems,
          matching_status: matchingStatus,
          matching_score: matchingScore,
          opening_balance: null, // TODO: Calculate from previous period
          closing_balance: totalAmount,
          variance: variance,
          matched_by: matchedBy,
          matched_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create SOA match: ${error.message}`);
      match = this.mapRowToMatch(newMatch);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'soa_match',
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
        matched_count: matchedCount,
        unmatched_count: unmatchedItems.length,
        variance: variance,
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return {
      match,
      matching_score: matchingScore,
      matched_count: matchedCount,
      unmatched_count: unmatchedItems.length,
      variance: variance,
    };
  }

  /**
   * Get match by ID
   */
  async getById(matchId: string): Promise<SOAMatch | null> {
    const { data, error } = await this.supabase
      .from('soa_auto_matching')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get SOA match: ${error.message}`);
    }

    return this.mapRowToMatch(data);
  }

  /**
   * Get matches for SOA document
   */
  async getBySOADocument(soaDocumentId: string): Promise<SOAMatch[]> {
    const { data, error } = await this.supabase
      .from('soa_auto_matching')
      .select('*')
      .eq('soa_document_id', soaDocumentId)
      .order('matched_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get SOA matches: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToMatch(row));
  }

  /**
   * Get audit trail for a match
   */
  async getAuditTrail(matchId: string) {
    return this.auditTrail.getByEntity('soa_match', matchId);
  }

  /**
   * Get SOA items
   */
  private async getSOAItems(soaDocumentId: string): Promise<SOAItem[]> {
    // Assuming soa_document_id maps to case_id in vmp_soa_items
    const { data, error } = await this.supabase
      .from('vmp_soa_items')
      .select('*')
      .eq('case_id', soaDocumentId)
      .order('line_number', { ascending: true });

    if (error) {
      throw new Error(`Failed to get SOA items: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToSOAItem(row));
  }

  /**
   * Get invoices for matching
   */
  private async getInvoices(vendorId: string, companyId: string) {
    const { data, error } = await this.supabase
      .from('vmp_invoices')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('company_id', companyId)
      .in('status', ['pending', 'matched']);

    if (error) {
      throw new Error(`Failed to get invoices: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get payments for matching
   */
  private async getPayments(vendorId: string, companyId: string) {
    const { data, error } = await this.supabase
      .from('vmp_payments')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('company_id', companyId);

    if (error) {
      throw new Error(`Failed to get payments: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Find invoice match for SOA item
   */
  private findInvoiceMatch(item: SOAItem, invoices: unknown[]): { id: string } | null {
    if (!item.invoice_number) return null;

    const invoice = invoices.find(
      (inv) => (inv as { invoice_num?: string; invoice_number?: string }).invoice_num === item.invoice_number ||
               (inv as { invoice_num?: string; invoice_number?: string }).invoice_number === item.invoice_number
    );

    return invoice ? { id: (invoice as { id: string }).id } : null;
  }

  /**
   * Find payment match for SOA item
   */
  private findPaymentMatch(item: SOAItem, payments: unknown[]): { id: string } | null {
    // Match by amount and date proximity
    const itemAmount = parseFloat(item.amount.toString());
    const itemDate = item.invoice_date ? new Date(item.invoice_date) : null;

    for (const payment of payments) {
      const pay = payment as { amount?: number; payment_date?: string; invoice_num?: string };
      const payAmount = parseFloat((pay.amount || 0).toString());
      const payDate = pay.payment_date ? new Date(pay.payment_date) : null;

      // Amount match (within 1% tolerance)
      if (Math.abs(itemAmount - payAmount) / itemAmount < 0.01) {
        // Date match (within 30 days)
        if (itemDate && payDate) {
          const daysDiff = Math.abs((itemDate.getTime() - payDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff <= 30) {
            return { id: (payment as { id: string }).id };
          }
        } else {
          // No date, match by amount only
          return { id: (payment as { id: string }).id };
        }
      }
    }

    return null;
  }

  /**
   * Update SOA item status
   */
  private async updateSOAItemStatus(itemId: string, status: SOAItem['status']) {
    await this.supabase
      .from('vmp_soa_items')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', itemId);
  }

  /**
   * Create SOA match record
   */
  private async createSOAMatchRecord(soaItemId: string, invoiceId: string, matchType: string, confidence: number) {
    await this.supabase
      .from('vmp_soa_matches')
      .insert({
        soa_item_id: soaItemId,
        invoice_id: invoiceId,
        match_type: matchType,
        match_confidence: confidence,
        is_exact_match: confidence === 1.0,
        matched_by: 'system',
        matched_at: new Date().toISOString(),
        status: 'pending',
      });
  }

  /**
   * Find existing match
   */
  private async findExistingMatch(soaDocumentId: string): Promise<SOAMatch | null> {
    const { data, error } = await this.supabase
      .from('soa_auto_matching')
      .select('*')
      .eq('soa_document_id', soaDocumentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find SOA match: ${error.message}`);
    }

    return this.mapRowToMatch(data);
  }

  /**
   * Map database row to SOAMatch
   */
  private mapRowToMatch(row: unknown): SOAMatch {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      soa_document_id: r.soa_document_id as string,
      soa_period_start: r.soa_period_start as string,
      soa_period_end: r.soa_period_end as string,
      matched_invoices: (r.matched_invoices as string[]) || [],
      matched_payments: (r.matched_payments as string[]) || [],
      unmatched_items: (r.unmatched_items as unknown[]) || [],
      matching_status: r.matching_status as SOAMatch['matching_status'],
      matching_score: (r.matching_score as number) || null,
      opening_balance: (r.opening_balance as number) || null,
      closing_balance: (r.closing_balance as number) || null,
      variance: (r.variance as number) || null,
      matched_by: (r.matched_by as string) || null,
      matched_at: r.matched_at as string,
      created_at: r.created_at as string,
    };
  }

  /**
   * Map database row to SOAItem
   */
  private mapRowToSOAItem(row: unknown): SOAItem {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      case_id: r.case_id as string,
      vendor_id: r.vendor_id as string,
      company_id: r.company_id as string,
      line_number: (r.line_number as number) || null,
      invoice_number: (r.invoice_number as string) || null,
      invoice_date: (r.invoice_date as string) || null,
      amount: r.amount as number,
      currency_code: r.currency_code as string,
      description: (r.description as string) || null,
      reference_number: (r.reference_number as string) || null,
      status: r.status as SOAItem['status'],
    };
  }
}


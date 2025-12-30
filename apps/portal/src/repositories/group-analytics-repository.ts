/**
 * Group Analytics Repository
 * 
 * Consolidated Spend Analytics: Real-time group-level analytics.
 * "How much do we spend on shipping?" → "$1,245,678.00" instantly.
 */

import { createClient } from '@/lib/supabase-client';

export interface SpendAnalytics {
  category: string;
  total_amount: number;
  currency_code: string;
  transaction_count: number;
  average_amount: number;
  subsidiaries: Array<{
    tenant_id: string;
    tenant_name: string;
    amount: number;
  }>;
}

export interface GroupAnalyticsFilters {
  category?: string;
  date_from?: string;
  date_to?: string;
  tenant_ids?: string[];
  vendor_ids?: string[];
}

export class GroupAnalyticsRepository {
  private supabase = createClient();

  /**
   * Get consolidated spend by category
   */
  async getSpendByCategory(
    groupId: string,
    filters?: GroupAnalyticsFilters
  ): Promise<SpendAnalytics[]> {
    // Get all tenants in group
    const { data: tenants } = await this.supabase
      .from('tenants')
      .select('id, name')
      .eq('group_id', groupId);

    if (!tenants || tenants.length === 0) {
      return [];
    }

    const tenantIds = filters?.tenant_ids || tenants.map((t) => t.id);

    // Query invoices by category
    let invoiceQuery = this.supabase
      .from('vmp_invoices')
      .select('amount, currency_code, category, tenant_id')
      .in('tenant_id', tenantIds)
      .in('status', ['approved', 'matched', 'paid']);

    if (filters?.category) {
      invoiceQuery = invoiceQuery.eq('category', filters.category);
    }

    if (filters?.date_from) {
      invoiceQuery = invoiceQuery.gte('invoice_date', filters.date_from);
    }

    if (filters?.date_to) {
      invoiceQuery = invoiceQuery.lte('invoice_date', filters.date_to);
    }

    if (filters?.vendor_ids) {
      invoiceQuery = invoiceQuery.in('vendor_id', filters.vendor_ids);
    }

    const { data: invoices, error } = await invoiceQuery;

    if (error) {
      throw new Error(`Failed to get spend analytics: ${error.message}`);
    }

    // Group by category
    const categoryMap = new Map<string, SpendAnalytics>();

    for (const invoice of invoices || []) {
      const category = (invoice.category as string) || 'uncategorized';
      const amount = parseFloat((invoice.amount || 0).toString());
      const currency = invoice.currency_code || 'USD';
      const tenantId = invoice.tenant_id as string;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          total_amount: 0,
          currency_code: currency,
          transaction_count: 0,
          average_amount: 0,
          subsidiaries: [],
        });
      }

      const analytics = categoryMap.get(category)!;
      analytics.total_amount += amount;
      analytics.transaction_count += 1;

      // Add to subsidiary breakdown
      const tenant = tenants.find((t) => t.id === tenantId);
      const existingSub = analytics.subsidiaries.find((s) => s.tenant_id === tenantId);
      if (existingSub) {
        existingSub.amount += amount;
      } else {
        analytics.subsidiaries.push({
          tenant_id: tenantId,
          tenant_name: tenant?.name || 'Unknown',
          amount,
        });
      }
    }

    // Calculate averages
    for (const analytics of categoryMap.values()) {
      analytics.average_amount = analytics.transaction_count > 0
        ? analytics.total_amount / analytics.transaction_count
        : 0;
    }

    return Array.from(categoryMap.values()).sort((a, b) => b.total_amount - a.total_amount);
  }

  /**
   * Get total group spend
   */
  async getTotalSpend(
    groupId: string,
    filters?: GroupAnalyticsFilters
  ): Promise<number> {
    const analytics = await this.getSpendByCategory(groupId, filters);
    return analytics.reduce((sum, a) => sum + a.total_amount, 0);
  }

  /**
   * Get spend by vendor
   */
  async getSpendByVendor(
    groupId: string,
    filters?: GroupAnalyticsFilters
  ): Promise<Array<{ vendor_id: string; vendor_name: string; total_amount: number; transaction_count: number }>> {
    const { data: tenants } = await this.supabase
      .from('tenants')
      .select('id')
      .eq('group_id', groupId);

    if (!tenants || tenants.length === 0) {
      return [];
    }

    const tenantIds = filters?.tenant_ids || tenants.map((t) => t.id);

    let invoiceQuery = this.supabase
      .from('vmp_invoices')
      .select('amount, vendor_id, vmp_vendors!inner(legal_name)')
      .in('tenant_id', tenantIds)
      .in('status', ['approved', 'matched', 'paid']);

    if (filters?.date_from) {
      invoiceQuery = invoiceQuery.gte('invoice_date', filters.date_from);
    }

    if (filters?.date_to) {
      invoiceQuery = invoiceQuery.lte('invoice_date', filters.date_to);
    }

    const { data: invoices, error } = await invoiceQuery;

    if (error) {
      throw new Error(`Failed to get vendor spend: ${error.message}`);
    }

    const vendorMap = new Map<string, { vendor_id: string; vendor_name: string; total_amount: number; transaction_count: number }>();

    for (const invoice of invoices || []) {
      const vendorId = invoice.vendor_id as string;
      const vendorName = (invoice.vmp_vendors as { legal_name: string })?.legal_name || 'Unknown';
      const amount = parseFloat((invoice.amount || 0).toString());

      if (!vendorMap.has(vendorId)) {
        vendorMap.set(vendorId, {
          vendor_id: vendorId,
          vendor_name: vendorName,
          total_amount: 0,
          transaction_count: 0,
        });
      }

      const vendor = vendorMap.get(vendorId)!;
      vendor.total_amount += amount;
      vendor.transaction_count += 1;
    }

    return Array.from(vendorMap.values()).sort((a, b) => b.total_amount - a.total_amount);
  }
}


/**
 * Vendor Search Repository with Semantic Search
 * 
 * Duplicate Destroyer: Semantic search to prevent duplicate vendors.
 * Uses pg_trgm for fuzzy matching and meaning understanding.
 */

import { createServiceClient } from '@/lib/supabase-client';

export interface VendorSearchResult {
  vendor: {
    id: string;
    legal_name: string;
    display_name: string | null;
    country_code: string | null;
    status: string;
  };
  similarity_score: number; // 0-1, how similar to search term
  match_reason: string;
}

export class VendorSearchRepository {
  private supabase = createServiceClient();

  /**
   * Semantic search for vendors (Duplicate Destroyer)
   */
  async semanticSearch(
    searchTerm: string,
    tenantId: string,
    limit: number = 10
  ): Promise<VendorSearchResult[]> {
    // Use pg_trgm similarity for fuzzy matching
    const { data, error } = await this.supabase.rpc('search_vendors_semantic', {
      p_search_term: searchTerm,
      p_tenant_id: tenantId,
      p_limit: limit,
    });

    if (error) {
      // Fallback to simple ILIKE search if function doesn't exist
      return this.fallbackSearch(searchTerm, tenantId, limit);
    }

    return (data || []).map((row: unknown) => this.mapRowToResult(row));
  }

  /**
   * Fallback search using ILIKE
   */
  private async fallbackSearch(
    searchTerm: string,
    tenantId: string,
    limit: number
  ): Promise<VendorSearchResult[]> {
    const { data, error } = await this.supabase
      .from('vmp_vendors')
      .select('*')
      .eq('tenant_id', tenantId)
      .or(`legal_name.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search vendors: ${error.message}`);
    }

    return (data || []).map((vendor) => ({
      vendor: {
        id: vendor.id,
        legal_name: vendor.legal_name,
        display_name: vendor.display_name,
        country_code: vendor.country_code,
        status: vendor.status,
      },
      similarity_score: 0.8, // Placeholder
      match_reason: 'Name match',
    }));
  }

  /**
   * Check for potential duplicates
   */
  async checkDuplicates(
    legalName: string,
    displayName: string | null,
    tenantId: string
  ): Promise<VendorSearchResult[]> {
    // Search for similar names
    const searchTerm = displayName || legalName;
    const results = await this.semanticSearch(searchTerm, tenantId, 5);

    // Filter by high similarity (potential duplicates)
    return results.filter((result) => result.similarity_score > 0.7);
  }

  /**
   * Map database row to VendorSearchResult
   */
  private mapRowToResult(row: unknown): VendorSearchResult {
    const r = row as Record<string, unknown>;
    return {
      vendor: {
        id: r.id as string,
        legal_name: r.legal_name as string,
        display_name: (r.display_name as string) || null,
        country_code: (r.country_code as string) || null,
        status: r.status as string,
      },
      similarity_score: parseFloat((r.similarity_score as number).toString()),
      match_reason: (r.match_reason as string) || 'Semantic match',
    };
  }
}


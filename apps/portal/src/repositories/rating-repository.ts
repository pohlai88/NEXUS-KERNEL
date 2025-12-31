/**
 * Rating Repository
 * 
 * Two-Way Rating System: Vendors rate Company/Staff, Company rates Vendors.
 * Transparency: Blackbox (private) or Whitebox (public).
 */

import { createServiceClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface Rating {
  id: string;
  tenant_id: string;
  rating_type: 'vendor_to_company' | 'vendor_to_staff' | 'vendor_to_department' | 'company_to_vendor';
  visibility: 'blackbox' | 'whitebox';
  rated_vendor_id: string | null;
  rated_user_id: string | null;
  rated_department: string | null;
  rated_company_id: string | null;
  rater_vendor_id: string | null;
  rater_user_id: string | null;
  overall_rating: number;
  communication_rating: number | null;
  professionalism_rating: number | null;
  timeliness_rating: number | null;
  problem_resolution_rating: number | null;
  rating_text: string | null;
  positive_aspects: string[];
  negative_aspects: string[];
  related_case_id: string | null;
  related_invoice_id: string | null;
  related_escalation_id: string | null;
  is_verified: boolean;
  is_anonymous: boolean;
  status: 'active' | 'hidden' | 'removed';
  created_at: string;
  updated_at: string;
}

export interface RatingAggregate {
  id: string;
  tenant_id: string;
  entity_type: 'vendor' | 'user' | 'department' | 'company';
  entity_id: string | null;
  entity_department: string | null;
  total_ratings: number;
  average_overall_rating: number;
  average_communication_rating: number;
  average_professionalism_rating: number;
  average_timeliness_rating: number;
  average_problem_resolution_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  last_updated_at: string;
}

export interface CreateRatingParams {
  tenant_id: string;
  rating_type: Rating['rating_type'];
  visibility?: Rating['visibility'];
  rated_vendor_id?: string;
  rated_user_id?: string;
  rated_department?: string;
  rated_company_id?: string;
  rater_vendor_id?: string;
  rater_user_id?: string;
  overall_rating: number;
  communication_rating?: number;
  professionalism_rating?: number;
  timeliness_rating?: number;
  problem_resolution_rating?: number;
  rating_text?: string;
  positive_aspects?: string[];
  negative_aspects?: string[];
  related_case_id?: string;
  related_invoice_id?: string;
  related_escalation_id?: string;
  is_anonymous?: boolean;
}

export class RatingRepository {
  private supabase = createServiceClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Create rating
   */
  async create(
    params: CreateRatingParams,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<Rating> {
    // Insert rating
    const { data: ratingData, error } = await this.supabase
      .from('ratings')
      .insert({
        tenant_id: params.tenant_id,
        rating_type: params.rating_type,
        visibility: params.visibility || 'whitebox',
        rated_vendor_id: params.rated_vendor_id || null,
        rated_user_id: params.rated_user_id || null,
        rated_department: params.rated_department || null,
        rated_company_id: params.rated_company_id || null,
        rater_vendor_id: params.rater_vendor_id || null,
        rater_user_id: params.rater_user_id || null,
        overall_rating: params.overall_rating,
        communication_rating: params.communication_rating || null,
        professionalism_rating: params.professionalism_rating || null,
        timeliness_rating: params.timeliness_rating || null,
        problem_resolution_rating: params.problem_resolution_rating || null,
        rating_text: params.rating_text || null,
        positive_aspects: params.positive_aspects || [],
        negative_aspects: params.negative_aspects || [],
        related_case_id: params.related_case_id || null,
        related_invoice_id: params.related_invoice_id || null,
        related_escalation_id: params.related_escalation_id || null,
        is_anonymous: params.is_anonymous || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create rating: ${error.message}`);
    }

    // Update rating aggregates
    await this.updateAggregates(params);

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'rating',
      entity_id: ratingData.id,
      action: 'create',
      action_by: params.rater_user_id || params.rater_vendor_id || 'system',
      new_state: ratingData,
      workflow_stage: 'active',
      workflow_state: {
        rating_type: params.rating_type,
        overall_rating: params.overall_rating,
        visibility: params.visibility || 'whitebox',
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToRating(ratingData);
  }

  /**
   * Get ratings for entity
   */
  async getRatings(
    entityType: 'vendor' | 'user' | 'department' | 'company',
    entityId: string | null,
    entityDepartment: string | null = null,
    tenantId: string,
    visibility?: 'blackbox' | 'whitebox'
  ): Promise<Rating[]> {
    let query = this.supabase
      .from('ratings')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    if (visibility) {
      query = query.eq('visibility', visibility);
    }

    if (entityType === 'vendor') {
      query = query.eq('rated_vendor_id', entityId);
    } else if (entityType === 'user') {
      query = query.eq('rated_user_id', entityId);
    } else if (entityType === 'department') {
      query = query.eq('rated_department', entityDepartment);
    } else if (entityType === 'company') {
      query = query.eq('rated_company_id', entityId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get ratings: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToRating(row));
  }

  /**
   * Get rating aggregate
   */
  async getAggregate(
    entityType: 'vendor' | 'user' | 'department' | 'company',
    entityId: string | null,
    entityDepartment: string | null = null,
    tenantId: string
  ): Promise<RatingAggregate | null> {
    let query = this.supabase
      .from('rating_aggregates')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType);

    if (entityId) {
      query = query.eq('entity_id', entityId);
    } else {
      query = query.is('entity_id', null);
    }

    if (entityDepartment) {
      query = query.eq('entity_department', entityDepartment);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get rating aggregate: ${error.message}`);
    }

    return this.mapRowToAggregate(data);
  }

  /**
   * Update rating aggregates
   */
  private async updateAggregates(params: CreateRatingParams): Promise<void> {
    let entityType: 'vendor' | 'user' | 'department' | 'company' = 'vendor';
    let entityId: string | null = null;
    let entityDepartment: string | null = null;

    if (params.rated_vendor_id) {
      entityType = 'vendor';
      entityId = params.rated_vendor_id;
    } else if (params.rated_user_id) {
      entityType = 'user';
      entityId = params.rated_user_id;
    } else if (params.rated_department) {
      entityType = 'department';
      entityDepartment = params.rated_department;
    } else if (params.rated_company_id) {
      entityType = 'company';
      entityId = params.rated_company_id;
    }

    // Call PostgreSQL function to update aggregates
    const { error } = await this.supabase.rpc('update_rating_aggregate', {
      p_tenant_id: params.tenant_id,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_entity_department: entityDepartment,
    });

    if (error) {
      console.error('Failed to update rating aggregates:', error);
      // Don't throw - aggregates are not critical for rating creation
    }
  }

  /**
   * Map database row to Rating
   */
  private mapRowToRating(row: unknown): Rating {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      rating_type: r.rating_type as Rating['rating_type'],
      visibility: r.visibility as Rating['visibility'],
      rated_vendor_id: (r.rated_vendor_id as string) || null,
      rated_user_id: (r.rated_user_id as string) || null,
      rated_department: (r.rated_department as string) || null,
      rated_company_id: (r.rated_company_id as string) || null,
      rater_vendor_id: (r.rater_vendor_id as string) || null,
      rater_user_id: (r.rater_user_id as string) || null,
      overall_rating: r.overall_rating as number,
      communication_rating: (r.communication_rating as number) || null,
      professionalism_rating: (r.professionalism_rating as number) || null,
      timeliness_rating: (r.timeliness_rating as number) || null,
      problem_resolution_rating: (r.problem_resolution_rating as number) || null,
      rating_text: (r.rating_text as string) || null,
      positive_aspects: (r.positive_aspects as string[]) || [],
      negative_aspects: (r.negative_aspects as string[]) || [],
      related_case_id: (r.related_case_id as string) || null,
      related_invoice_id: (r.related_invoice_id as string) || null,
      related_escalation_id: (r.related_escalation_id as string) || null,
      is_verified: (r.is_verified as boolean) || false,
      is_anonymous: (r.is_anonymous as boolean) || false,
      status: r.status as Rating['status'],
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }

  /**
   * Map database row to RatingAggregate
   */
  private mapRowToAggregate(row: unknown): RatingAggregate {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      entity_type: r.entity_type as RatingAggregate['entity_type'],
      entity_id: (r.entity_id as string) || null,
      entity_department: (r.entity_department as string) || null,
      total_ratings: (r.total_ratings as number) || 0,
      average_overall_rating: parseFloat((r.average_overall_rating as number).toString()),
      average_communication_rating: parseFloat((r.average_communication_rating as number).toString()),
      average_professionalism_rating: parseFloat((r.average_professionalism_rating as number).toString()),
      average_timeliness_rating: parseFloat((r.average_timeliness_rating as number).toString()),
      average_problem_resolution_rating: parseFloat((r.average_problem_resolution_rating as number).toString()),
      five_star_count: (r.five_star_count as number) || 0,
      four_star_count: (r.four_star_count as number) || 0,
      three_star_count: (r.three_star_count as number) || 0,
      two_star_count: (r.two_star_count as number) || 0,
      one_star_count: (r.one_star_count as number) || 0,
      last_updated_at: r.last_updated_at as string,
    };
  }
}


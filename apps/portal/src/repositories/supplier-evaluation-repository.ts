/**
 * Supplier Evaluation/KPI Repository with Audit Trail
 * 
 * Manages supplier evaluations and KPI tracking with automatic audit trail logging.
 * Every evaluation and KPI calculation creates an immutable audit record.
 */

import { createClient } from '@/lib/supabase-client';
import { AuditTrailRepository } from './audit-trail-repository';

export interface SupplierEvaluation {
  id: string;
  tenant_id: string;
  vendor_id: string;
  evaluation_period_start: string;
  evaluation_period_end: string;
  evaluation_type: 'quarterly' | 'annual' | 'ad_hoc';
  overall_score: number; // 0-100
  kpi_scores: Record<string, number>; // JSONB: { kpi_id: score }
  kpi_metrics: Record<string, unknown>; // JSONB: detailed KPI metrics
  evaluation_notes: string | null;
  evaluated_by: string | null;
  evaluated_at: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CreateEvaluationParams {
  tenant_id: string;
  vendor_id: string;
  evaluation_period_start: string;
  evaluation_period_end: string;
  evaluation_type: SupplierEvaluation['evaluation_type'];
  kpi_scores?: Record<string, number>;
  kpi_metrics?: Record<string, unknown>;
  evaluation_notes?: string;
}

export interface UpdateEvaluationParams {
  overall_score?: number;
  kpi_scores?: Record<string, number>;
  kpi_metrics?: Record<string, unknown>;
  evaluation_notes?: string;
  status?: SupplierEvaluation['status'];
}

export interface KPICalculation {
  kpi_id: string;
  kpi_name: string;
  score: number;
  metrics: Record<string, unknown>;
  calculation_method: string;
  calculated_at: string;
}

export class SupplierEvaluationRepository {
  private supabase = createClient();
  private auditTrail = new AuditTrailRepository();

  /**
   * Create evaluation with audit trail
   */
  async create(
    params: CreateEvaluationParams,
    createdBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<SupplierEvaluation> {
    // Calculate overall score from KPI scores
    const overallScore = this.calculateOverallScore(params.kpi_scores || {});

    // Insert evaluation
    const { data: evaluationData, error } = await this.supabase
      .from('supplier_evaluations')
      .insert({
        tenant_id: params.tenant_id,
        vendor_id: params.vendor_id,
        evaluation_period_start: params.evaluation_period_start,
        evaluation_period_end: params.evaluation_period_end,
        evaluation_type: params.evaluation_type,
        overall_score: overallScore,
        kpi_scores: params.kpi_scores || {},
        kpi_metrics: params.kpi_metrics || {},
        evaluation_notes: params.evaluation_notes || null,
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create evaluation: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_evaluation',
      entity_id: evaluationData.id,
      action: 'create',
      action_by: createdBy,
      new_state: evaluationData,
      workflow_stage: 'draft',
      workflow_state: {
        status: 'draft',
        overall_score: overallScore,
        evaluation_type: params.evaluation_type,
        vendor_id: params.vendor_id,
      },
      tenant_id: params.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToEvaluation(evaluationData);
  }

  /**
   * Update evaluation with audit trail
   */
  async update(
    evaluationId: string,
    params: UpdateEvaluationParams,
    updatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<SupplierEvaluation> {
    // Get current evaluation state
    const currentEvaluation = await this.getById(evaluationId);
    if (!currentEvaluation) {
      throw new Error('Evaluation not found');
    }

    // Calculate overall score if KPI scores changed
    const kpiScores = params.kpi_scores || currentEvaluation.kpi_scores;
    const overallScore = params.overall_score !== undefined
      ? params.overall_score
      : this.calculateOverallScore(kpiScores);

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (params.overall_score !== undefined) updatePayload.overall_score = params.overall_score;
    if (params.kpi_scores !== undefined) updatePayload.kpi_scores = params.kpi_scores;
    if (params.kpi_metrics !== undefined) updatePayload.kpi_metrics = params.kpi_metrics;
    if (params.evaluation_notes !== undefined) updatePayload.evaluation_notes = params.evaluation_notes;
    if (params.status !== undefined) updatePayload.status = params.status;

    // Update overall score if not explicitly set
    if (params.overall_score === undefined && params.kpi_scores !== undefined) {
      updatePayload.overall_score = overallScore;
    }

    // Update evaluation
    const { data: updatedEvaluation, error } = await this.supabase
      .from('supplier_evaluations')
      .update(updatePayload)
      .eq('id', evaluationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update evaluation: ${error.message}`);
    }

    // Calculate changes
    const changes: Record<string, unknown> = {};
    if (params.overall_score !== undefined && params.overall_score !== currentEvaluation.overall_score) {
      changes.overall_score = { from: currentEvaluation.overall_score, to: params.overall_score };
    }
    if (params.status && params.status !== currentEvaluation.status) {
      changes.status = { from: currentEvaluation.status, to: params.status };
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_evaluation',
      entity_id: evaluationId,
      action: 'update',
      action_by: updatedBy,
      old_state: currentEvaluation,
      new_state: updatedEvaluation,
      changes,
      workflow_stage: updatedEvaluation.status,
      workflow_state: {
        status: updatedEvaluation.status,
        overall_score: updatedEvaluation.overall_score,
        evaluation_type: updatedEvaluation.evaluation_type,
        vendor_id: updatedEvaluation.vendor_id,
      },
      tenant_id: currentEvaluation.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToEvaluation(updatedEvaluation);
  }

  /**
   * Submit evaluation for approval with audit trail
   */
  async submit(
    evaluationId: string,
    submittedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<SupplierEvaluation> {
    return this.update(
      evaluationId,
      { status: 'submitted' },
      submittedBy,
      requestContext
    );
  }

  /**
   * Approve evaluation with audit trail
   */
  async approve(
    evaluationId: string,
    approvedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<SupplierEvaluation> {
    const currentEvaluation = await this.getById(evaluationId);
    if (!currentEvaluation) {
      throw new Error('Evaluation not found');
    }

    const { data: updatedEvaluation, error } = await this.supabase
      .from('supplier_evaluations')
      .update({
        status: 'approved',
        evaluated_by: approvedBy,
        evaluated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', evaluationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to approve evaluation: ${error.message}`);
    }

    // Create audit trail record
    await this.auditTrail.insert({
      entity_type: 'supplier_evaluation',
      entity_id: evaluationId,
      action: 'approve',
      action_by: approvedBy,
      old_state: currentEvaluation,
      new_state: updatedEvaluation,
      workflow_stage: 'approved',
      workflow_state: {
        status: 'approved',
        overall_score: updatedEvaluation.overall_score,
        evaluated_by: approvedBy,
        evaluated_at: updatedEvaluation.evaluated_at,
      },
      tenant_id: currentEvaluation.tenant_id,
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return this.mapRowToEvaluation(updatedEvaluation);
  }

  /**
   * Calculate KPI scores for a vendor
   */
  async calculateKPIs(
    vendorId: string,
    periodStart: string,
    periodEnd: string,
    calculatedBy: string,
    requestContext?: { ip_address?: string; user_agent?: string; request_id?: string }
  ): Promise<KPICalculation[]> {
    // Get vendor invoices for the period
    const { data: invoices } = await this.supabase
      .from('vmp_invoices')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('invoice_date', periodStart)
      .lte('invoice_date', periodEnd);

    // Get vendor payments for the period
    const { data: payments } = await this.supabase
      .from('vmp_payments')
      .select('*')
      .eq('vendor_id', vendorId)
      .gte('payment_date', periodStart)
      .lte('payment_date', periodEnd);

    // Calculate KPIs (simplified - in production, use actual KPI definitions)
    const kpiCalculations: KPICalculation[] = [
      {
        kpi_id: 'on_time_payment',
        kpi_name: 'On-Time Payment Rate',
        score: this.calculateOnTimePaymentRate(invoices || [], payments || []),
        metrics: {
          total_invoices: invoices?.length || 0,
          on_time_payments: this.countOnTimePayments(invoices || [], payments || []),
        },
        calculation_method: 'on_time_payments / total_invoices * 100',
        calculated_at: new Date().toISOString(),
      },
      {
        kpi_id: 'invoice_accuracy',
        kpi_name: 'Invoice Accuracy Rate',
        score: this.calculateInvoiceAccuracy(invoices || []),
        metrics: {
          total_invoices: invoices?.length || 0,
          accurate_invoices: this.countAccurateInvoices(invoices || []),
        },
        calculation_method: 'accurate_invoices / total_invoices * 100',
        calculated_at: new Date().toISOString(),
      },
    ];

    // Create audit trail for KPI calculation
    await this.auditTrail.insert({
      entity_type: 'supplier_kpi',
      entity_id: vendorId,
      action: 'calculate',
      action_by: calculatedBy,
      new_state: {
        vendor_id: vendorId,
        period_start: periodStart,
        period_end: periodEnd,
        kpi_calculations: kpiCalculations,
      },
      workflow_stage: 'calculated',
      workflow_state: {
        kpi_count: kpiCalculations.length,
        average_score: kpiCalculations.reduce((sum, kpi) => sum + kpi.score, 0) / kpiCalculations.length,
      },
      tenant_id: 'default', // TODO: Get from context
      ip_address: requestContext?.ip_address,
      user_agent: requestContext?.user_agent,
      request_id: requestContext?.request_id,
    });

    return kpiCalculations;
  }

  /**
   * Get evaluation by ID
   */
  async getById(evaluationId: string): Promise<SupplierEvaluation | null> {
    const { data, error } = await this.supabase
      .from('supplier_evaluations')
      .select('*')
      .eq('id', evaluationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get evaluation: ${error.message}`);
    }

    return this.mapRowToEvaluation(data);
  }

  /**
   * Get evaluations by vendor ID
   */
  async getByVendor(vendorId: string): Promise<SupplierEvaluation[]> {
    const { data, error } = await this.supabase
      .from('supplier_evaluations')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('evaluation_period_end', { ascending: false });

    if (error) {
      throw new Error(`Failed to get evaluations: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToEvaluation(row));
  }

  /**
   * Get audit trail for evaluation
   */
  async getAuditTrail(evaluationId: string) {
    return this.auditTrail.getByEntity('supplier_evaluation', evaluationId);
  }

  /**
   * Calculate overall score from KPI scores
   */
  private calculateOverallScore(kpiScores: Record<string, number>): number {
    const scores = Object.values(kpiScores);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  /**
   * Calculate on-time payment rate
   */
  private calculateOnTimePaymentRate(invoices: unknown[], payments: unknown[]): number {
    // Simplified calculation - in production, use actual due dates and payment dates
    if (invoices.length === 0) return 100;
    const onTimeCount = this.countOnTimePayments(invoices, payments);
    return Math.round((onTimeCount / invoices.length) * 100);
  }

  /**
   * Count on-time payments
   */
  private countOnTimePayments(invoices: unknown[], payments: unknown[]): number {
    // Simplified - in production, compare due_date with payment_date
    return Math.min(invoices.length, payments.length);
  }

  /**
   * Calculate invoice accuracy rate
   */
  private calculateInvoiceAccuracy(invoices: unknown[]): number {
    if (invoices.length === 0) return 100;
    const accurateCount = this.countAccurateInvoices(invoices);
    return Math.round((accurateCount / invoices.length) * 100);
  }

  /**
   * Count accurate invoices
   */
  private countAccurateInvoices(invoices: unknown[]): number {
    // Simplified - in production, check 3-way matching results
    return invoices.length; // Assume all are accurate for now
  }

  /**
   * Map database row to SupplierEvaluation
   */
  private mapRowToEvaluation(row: unknown): SupplierEvaluation {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      tenant_id: r.tenant_id as string,
      vendor_id: r.vendor_id as string,
      evaluation_period_start: r.evaluation_period_start as string,
      evaluation_period_end: r.evaluation_period_end as string,
      evaluation_type: r.evaluation_type as SupplierEvaluation['evaluation_type'],
      overall_score: (r.overall_score as number) || 0,
      kpi_scores: (r.kpi_scores as Record<string, number>) || {},
      kpi_metrics: (r.kpi_metrics as Record<string, unknown>) || {},
      evaluation_notes: (r.evaluation_notes as string) || null,
      evaluated_by: (r.evaluated_by as string) || null,
      evaluated_at: (r.evaluated_at as string) || null,
      status: r.status as SupplierEvaluation['status'],
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}


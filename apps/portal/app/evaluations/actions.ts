/**
 * Supplier Evaluation/KPI Server Actions with Audit Trail
 * 
 * Server Actions for supplier evaluation and KPI operations with automatic audit trail logging.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { SupplierEvaluationRepository, type CreateEvaluationParams, type UpdateEvaluationParams } from '@/src/repositories/supplier-evaluation-repository';

// TODO: Get RequestContext from authentication middleware
function getRequestContext() {
  return {
    actor: {
      userId: 'system', // TODO: Get from auth
      tenantId: 'default', // TODO: Get from auth
      roles: [],
    },
    requestId: crypto.randomUUID(),
  };
}

export async function createEvaluationAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const evaluationRepo = new SupplierEvaluationRepository();

    const params: CreateEvaluationParams = {
      tenant_id: ctx.actor.tenantId || 'default',
      vendor_id: formData.get('vendor_id') as string,
      evaluation_period_start: formData.get('evaluation_period_start') as string,
      evaluation_period_end: formData.get('evaluation_period_end') as string,
      evaluation_type: formData.get('evaluation_type') as CreateEvaluationParams['evaluation_type'],
      kpi_scores: formData.get('kpi_scores') ? JSON.parse(formData.get('kpi_scores') as string) : undefined,
      kpi_metrics: formData.get('kpi_metrics') ? JSON.parse(formData.get('kpi_metrics') as string) : undefined,
      evaluation_notes: formData.get('evaluation_notes') as string || undefined,
    };

    const evaluation = await evaluationRepo.create(
      params,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/evaluations');
    return { success: true, evaluation_id: evaluation.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create evaluation',
    };
  }
}

export async function updateEvaluationAction(
  evaluationId: string,
  formData: FormData
) {
  try {
    const ctx = getRequestContext();
    const evaluationRepo = new SupplierEvaluationRepository();

    const params: UpdateEvaluationParams = {};

    if (formData.get('overall_score')) {
      params.overall_score = parseFloat(formData.get('overall_score') as string);
    }

    if (formData.get('kpi_scores')) {
      params.kpi_scores = JSON.parse(formData.get('kpi_scores') as string);
    }

    if (formData.get('kpi_metrics')) {
      params.kpi_metrics = JSON.parse(formData.get('kpi_metrics') as string);
    }

    if (formData.get('evaluation_notes')) {
      params.evaluation_notes = formData.get('evaluation_notes') as string;
    }

    if (formData.get('status')) {
      params.status = formData.get('status') as UpdateEvaluationParams['status'];
    }

    const updatedEvaluation = await evaluationRepo.update(
      evaluationId,
      params,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/evaluations');
    revalidatePath(`/evaluations/${evaluationId}`);
    return { success: true, evaluation: updatedEvaluation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update evaluation',
    };
  }
}

export async function submitEvaluationAction(evaluationId: string) {
  try {
    const ctx = getRequestContext();
    const evaluationRepo = new SupplierEvaluationRepository();

    const submittedEvaluation = await evaluationRepo.submit(
      evaluationId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/evaluations');
    revalidatePath(`/evaluations/${evaluationId}`);
    return { success: true, evaluation: submittedEvaluation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to submit evaluation',
    };
  }
}

export async function approveEvaluationAction(evaluationId: string) {
  try {
    const ctx = getRequestContext();
    const evaluationRepo = new SupplierEvaluationRepository();

    const approvedEvaluation = await evaluationRepo.approve(
      evaluationId,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/evaluations');
    revalidatePath(`/evaluations/${evaluationId}`);
    return { success: true, evaluation: approvedEvaluation };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to approve evaluation',
    };
  }
}

export async function calculateKPIsAction(
  vendorId: string,
  periodStart: string,
  periodEnd: string
) {
  try {
    const ctx = getRequestContext();
    const evaluationRepo = new SupplierEvaluationRepository();

    const kpiCalculations = await evaluationRepo.calculateKPIs(
      vendorId,
      periodStart,
      periodEnd,
      ctx.actor.userId,
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/evaluations');
    return { success: true, kpi_calculations: kpiCalculations };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to calculate KPIs',
    };
  }
}


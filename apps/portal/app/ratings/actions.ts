/**
 * Rating Server Actions
 * 
 * Two-Way Rating System: Vendors rate Company/Staff, Company rates Vendors.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { RatingRepository } from '@/src/repositories/rating-repository';

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

export async function createRatingAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const ratingRepo = new RatingRepository();

    const rating = await ratingRepo.create(
      {
        tenant_id: ctx.actor.tenantId || 'default',
        rating_type: formData.get('rating_type') as 'vendor_to_company' | 'vendor_to_staff' | 'vendor_to_department' | 'company_to_vendor',
        visibility: (formData.get('visibility') as 'blackbox' | 'whitebox') || 'whitebox',
        rated_vendor_id: formData.get('rated_vendor_id') as string || undefined,
        rated_user_id: formData.get('rated_user_id') as string || undefined,
        rated_department: formData.get('rated_department') as string || undefined,
        rated_company_id: formData.get('rated_company_id') as string || undefined,
        rater_vendor_id: formData.get('rater_vendor_id') as string || undefined,
        rater_user_id: ctx.actor.userId || undefined,
        overall_rating: parseInt(formData.get('overall_rating') as string),
        communication_rating: formData.get('communication_rating') ? parseInt(formData.get('communication_rating') as string) : undefined,
        professionalism_rating: formData.get('professionalism_rating') ? parseInt(formData.get('professionalism_rating') as string) : undefined,
        timeliness_rating: formData.get('timeliness_rating') ? parseInt(formData.get('timeliness_rating') as string) : undefined,
        problem_resolution_rating: formData.get('problem_resolution_rating') ? parseInt(formData.get('problem_resolution_rating') as string) : undefined,
        rating_text: formData.get('rating_text') as string || undefined,
        positive_aspects: formData.get('positive_aspects') ? JSON.parse(formData.get('positive_aspects') as string) : undefined,
        negative_aspects: formData.get('negative_aspects') ? JSON.parse(formData.get('negative_aspects') as string) : undefined,
        related_case_id: formData.get('related_case_id') as string || undefined,
        related_invoice_id: formData.get('related_invoice_id') as string || undefined,
        related_escalation_id: formData.get('related_escalation_id') as string || undefined,
        is_anonymous: formData.get('is_anonymous') === 'true',
      },
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/ratings');
    return { success: true, rating_id: rating.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create rating',
    };
  }
}


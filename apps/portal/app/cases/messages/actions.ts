/**
 * Case Messages Server Actions with Audit Trail
 * 
 * Server Actions for case message operations with automatic audit trail logging.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { MessageRepository, type CreateMessageParams } from '@/src/repositories/message-repository';

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

export async function createMessageAction(formData: FormData) {
  try {
    const ctx = getRequestContext();
    const messageRepo = new MessageRepository();

    const params: CreateMessageParams = {
      case_id: formData.get('case_id') as string,
      channel_source: (formData.get('channel_source') as CreateMessageParams['channel_source']) || 'portal',
      sender_type: (formData.get('sender_type') as CreateMessageParams['sender_type']) || 'internal',
      sender_user_id: formData.get('sender_user_id') as string || ctx.actor.userId,
      body: formData.get('body') as string,
      is_internal_note: formData.get('is_internal_note') === 'true',
      metadata: formData.get('metadata') ? JSON.parse(formData.get('metadata') as string) : undefined,
    };

    const message = await messageRepo.create(
      params,
      ctx.actor.tenantId || 'default',
      {
        request_id: ctx.requestId,
      }
    );

    revalidatePath('/cases');
    revalidatePath(`/cases/${params.case_id}`);
    return { success: true, message_id: message.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create message',
    };
  }
}


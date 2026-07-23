'use server';

import { redirect } from 'next/navigation';
import { studyPlans } from './server/study-plans';
import { createTutorConversation } from '@/features/tutor/server/tutor';

export async function generatePlan() {
  await studyPlans.generate();
  redirect('/app/plan/week');
}

export async function executePlanItem(formData: FormData) {
  const id = String(formData.get('itemId'));
  const action = String(formData.get('action')) as
    | 'start'
    | 'complete'
    | 'defer'
    | 'skip';
  const actual = formData.get('actualMinutes');
  const reason = String(formData.get('reason') ?? '').trim();
  await studyPlans.action(id, action, {
    actualMinutes:
      actual === null || String(actual) === '' ? null : Number(actual),
    reason: reason || null,
  });
  redirect(action === 'start' ? `/app/plan?item=${id}` : '/app/plan/today');
}

export async function askTutorAboutPlanItem(formData: FormData) {
  const itemId = String(formData.get('itemId'));
  const conversation = await createTutorConversation({
    mode: 'plan_explanation',
    originType: 'plan_item',
    originId: itemId,
  });
  redirect(`/app/tutor/${conversation.id}?ask=plan-item`);
}

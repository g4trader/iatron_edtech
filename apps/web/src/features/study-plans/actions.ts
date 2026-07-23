'use server';

import { redirect } from 'next/navigation';
import { studyPlans } from './server/study-plans';

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

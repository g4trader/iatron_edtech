'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { editorial } from './server/editorial';
import { studyPlans } from '@/features/study-plans/server/study-plans';

export async function startLearningActivity(formData: FormData) {
  const itemId = String(formData.get('itemId'));
  await studyPlans.action(itemId, 'start', {
    actualMinutes: null,
    reason: null,
  });
  revalidatePath('/app');
  revalidatePath('/app/plan');
  redirect(`/app/plan/items/${itemId}` as Route);
}

export async function completeLearningActivity(formData: FormData) {
  const itemId = String(formData.get('itemId'));
  const minutes = Number(formData.get('actualMinutes'));
  await studyPlans.action(itemId, 'complete', {
    actualMinutes: minutes,
    reason: null,
  });
  revalidatePath('/app');
  revalidatePath('/app/plan');
  redirect('/app');
}

export async function requestReviewPriority(formData: FormData) {
  const versionId = String(formData.get('versionId'));
  await editorial.mutate(
    `/learning-content/versions/${versionId}/review-priority`,
    {},
  );
  revalidatePath(`/app/content/${versionId}`);
}

export async function submitMentorDecision(formData: FormData) {
  const versionId = String(formData.get('versionId'));
  const decision = String(formData.get('decision'));
  await editorial.mutate(`/review/contents/${versionId}/decision`, {
    decision,
    declaration: String(formData.get('declaration') ?? '') || null,
    comment: String(formData.get('comment') ?? '') || null,
    issueCategory: String(formData.get('issueCategory') ?? '') || null,
    requestId: crypto.randomUUID(),
  });
  revalidatePath('/review');
  redirect('/review' as Route);
}

export async function publishContent(formData: FormData) {
  const versionId = String(formData.get('versionId'));
  await editorial.mutate(`/admin/editorial/contents/${versionId}/publish`, {});
  revalidatePath('/admin');
  revalidatePath('/app');
}

export async function createEditorialDraft(formData: FormData) {
  const aiAssisted = formData.get('aiAssisted') === 'on';
  await editorial.mutate('/admin/editorial/contents', {
    canonicalKey: String(formData.get('canonicalKey')),
    slug: String(formData.get('slug')),
    title: String(formData.get('title')),
    summary: String(formData.get('summary')),
    estimatedMinutes: Number(formData.get('estimatedMinutes')),
    objectives: [String(formData.get('objective'))],
    sections: [
      {
        heading: String(formData.get('sectionHeading')),
        body: String(formData.get('sectionBody')),
      },
    ],
    keyPoints: [String(formData.get('keyPoint'))].filter(Boolean),
    examApplication: String(formData.get('examApplication')) || null,
    commonMistakes: [],
    quickReview: [],
    conclusion: String(formData.get('conclusion')) || null,
    specialtyId: String(formData.get('specialtyId')) || null,
    competencyId: String(formData.get('competencyId')) || null,
    aiAssisted,
    aiModel: aiAssisted ? 'gpt-5.6-sol' : null,
    promptVersion: aiAssisted ? 'editorial-mvp-v1' : null,
    isSynthetic: formData.get('isSynthetic') === 'on',
    requestId: crypto.randomUUID(),
  });
  revalidatePath('/admin');
  redirect('/admin' as Route);
}

export async function assignMentorForReview(formData: FormData) {
  const versionId = String(formData.get('versionId'));
  await editorial.mutate(
    `/admin/editorial/contents/${versionId}/assign-review`,
    { mentorId: String(formData.get('mentorId')) },
  );
  revalidatePath('/admin');
}

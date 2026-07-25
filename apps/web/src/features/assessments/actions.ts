'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  answerQuestion,
  finishAssessment,
  pauseAssessment,
  resumeAssessment,
  startAssessment,
} from './server/adaptive-assessment';
export async function startDiagnostic(formData: FormData) {
  const mode = String(formData.get('mode') ?? 'quick_screening') as
    | 'quick_screening'
    | 'full_diagnostic';
  const id = await startAssessment(mode);
  redirect(`/app/assessment/session?id=${id}`);
}
export async function submitDiagnosticAnswer(formData: FormData) {
  const assessmentId = String(formData.get('assessmentId'));
  await answerQuestion(assessmentId, {
    questionVersionId: String(formData.get('questionVersionId')),
    selectedOptionId: String(formData.get('selectedOptionId')),
    responseTimeMs: Number(formData.get('responseTimeMs') ?? 0),
    statedConfidence: String(formData.get('statedConfidence') ?? 'medium'),
  });
  redirect(`/app/assessment/session?id=${assessmentId}`);
}
export async function completeDiagnostic(formData: FormData) {
  const assessmentId = String(formData.get('assessmentId'));
  await finishAssessment(assessmentId);
  revalidatePath('/app');
  revalidatePath('/app/assessment/history');
  revalidatePath('/app/assessment/coverage');
  revalidatePath('/app/assessment/result');
  revalidatePath('/app/plan');
  redirect(`/app/assessment/result?id=${assessmentId}`);
}
export async function pauseDiagnostic(formData: FormData) {
  await pauseAssessment(String(formData.get('assessmentId')));
  revalidatePath('/app');
  redirect('/app');
}
export async function resumeDiagnostic(formData: FormData) {
  const id = String(formData.get('assessmentId'));
  await resumeAssessment(id);
  redirect(`/app/assessment/session?id=${id}`);
}

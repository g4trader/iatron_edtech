'use server';
import { onboardingInputSchema, type OnboardingInput } from '@iatron/contracts';
import { createClient } from '@/lib/supabase/server';

export async function saveOnboarding(input: OnboardingInput) {
  const parsed = onboardingInputSchema.parse(input);
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user)
    return {
      ok: false as const,
      message: 'Sua sessão expirou. Entre novamente.',
    };
  const { error } = await client.rpc('save_onboarding', {
    p_step: parsed.step,
    p_display_name: parsed.displayName ?? null,
    p_residency_year: parsed.residencyYear ?? null,
    p_graduation_year: parsed.graduationYear ?? null,
    p_experience_level: parsed.experienceLevel ?? null,
    p_preferred_session_minutes: parsed.preferredSessionMinutes ?? null,
    p_assessment_preference: parsed.assessmentPreference ?? null,
    p_availability: parsed.availability?.items ?? null,
    p_exam_edition_ids: parsed.examEditionIds ?? null,
    p_complete: parsed.complete,
  });
  return error
    ? {
        ok: false as const,
        message: 'Não foi possível salvar. Tente novamente.',
      }
    : { ok: true as const };
}

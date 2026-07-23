import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from '@/features/onboarding/components/onboarding-wizard';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';

export default async function OnboardingPage() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user && isAuthBypassEnabled(process.env)) {
    return (
      <OnboardingWizard
        e2eBypass
        initialStep={1}
        initialName=""
        initialResidencyYear={null}
        initialGraduationYear={null}
        initialExperienceLevel={null}
        initialSessionMinutes={null}
        initialAssessmentPreference={null}
        initialAvailability={[]}
        initialTargets={[]}
        editions={[
          {
            id: '10000000-0000-4000-8000-000000000001',
            year: 2027,
            programName: 'Residência médica nacional',
          },
        ]}
      />
    );
  }
  if (!user) redirect('/login?returnTo=/app/onboarding');
  const [
    profileResult,
    studentResult,
    availabilityResult,
    targetsResult,
    editionsResult,
  ] = await Promise.all([
    client
      .from('profiles')
      .select('display_name,onboarding_step')
      .eq('id', user.id)
      .single(),
    client
      .from('student_profiles')
      .select(
        'residency_year,graduation_year,experience_level,preferred_session_minutes,assessment_preference',
      )
      .eq('user_id', user.id)
      .single(),
    client
      .from('student_availability')
      .select('weekday,minutes_available')
      .eq('user_id', user.id),
    client
      .from('student_target_exams')
      .select('exam_edition_id')
      .eq('user_id', user.id),
    client
      .from('exam_editions')
      .select('id,year,exam_program_id')
      .order('application_date'),
  ]);
  const programIds = [
    ...new Set(
      (editionsResult.data ?? []).map((edition) => edition.exam_program_id),
    ),
  ];
  const { data: programs } = await client
    .from('exam_programs')
    .select('id,name')
    .in('id', programIds);
  const programNames = new Map(
    (programs ?? []).map((program) => [program.id, program.name]),
  );
  const editions = (editionsResult.data ?? []).map((edition) => ({
    id: edition.id,
    year: edition.year,
    programName: programNames.get(edition.exam_program_id) ?? 'Programa',
  }));
  return (
    <OnboardingWizard
      initialStep={profileResult.data?.onboarding_step ?? 1}
      initialName={profileResult.data?.display_name ?? ''}
      initialResidencyYear={studentResult.data?.residency_year ?? null}
      initialGraduationYear={studentResult.data?.graduation_year ?? null}
      initialExperienceLevel={
        (studentResult.data?.experience_level as
          | 'medical_student'
          | 'recent_graduate'
          | 'practicing_physician'
          | null) ?? null
      }
      initialSessionMinutes={
        studentResult.data?.preferred_session_minutes ?? null
      }
      initialAssessmentPreference={
        (studentResult.data?.assessment_preference as
          | 'guided'
          | 'independent'
          | 'mixed'
          | null) ?? null
      }
      initialAvailability={(availabilityResult.data ?? []).map((item) => ({
        weekday: item.weekday,
        minutesAvailable: item.minutes_available,
      }))}
      initialTargets={(targetsResult.data ?? []).map(
        (item) => item.exam_edition_id,
      )}
      editions={editions}
    />
  );
}

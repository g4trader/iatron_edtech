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
            programCode: 'NACIONAL',
            stateCode: 'RS',
            city: 'Porto Alegre',
            institutionName: 'Instituição de residência',
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
      .select('id,year,edition,city,exam_program_id')
      .eq('is_active', true)
      .order('year', { ascending: false }),
  ]);
  const programIds = [
    ...new Set(
      (editionsResult.data ?? []).map((edition) => edition.exam_program_id),
    ),
  ];
  const { data: programs } = await client
    .from('exam_programs')
    .select('id,name,code,state_code,city,institution_id')
    .in('id', programIds);
  const institutionIds = [
    ...new Set((programs ?? []).map((program) => program.institution_id)),
  ];
  const { data: institutions } = await client
    .from('institutions')
    .select('id,name')
    .in('id', institutionIds);
  const institutionNames = new Map(
    (institutions ?? []).map((institution) => [
      institution.id,
      institution.name,
    ]),
  );
  const programDetails = new Map(
    (programs ?? []).map((program) => [program.id, program]),
  );
  const editions = (editionsResult.data ?? [])
    .map((edition) => {
      const program = programDetails.get(edition.exam_program_id);
      return {
        id: edition.id,
        year: edition.year,
        edition: edition.edition,
        programName: program?.name ?? 'Programa de residência',
        programCode: program?.code ?? null,
        stateCode: program?.state_code ?? null,
        city: edition.city ?? program?.city ?? null,
        institutionName: program
          ? (institutionNames.get(program.institution_id) ?? program.name)
          : 'Instituição não informada',
      };
    })
    .sort(
      (a, b) =>
        Number(b.stateCode === 'RS') - Number(a.stateCode === 'RS') ||
        (a.stateCode ?? '').localeCompare(b.stateCode ?? '') ||
        a.programName.localeCompare(b.programName, 'pt-BR'),
    );
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

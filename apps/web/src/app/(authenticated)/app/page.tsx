import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { getAuthState } from '@/lib/auth';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { assessmentHistory } from '@/features/assessments/server/adaptive-assessment';
import { dominantMentor } from '@/features/mentors/mentors';
import { MentorIdentity } from '@/features/mentors/components/mentor';
import { examIntelligenceContext } from '@/features/exam-intelligence/server/context';
import { JourneyTimeline } from '@/features/journey/components/journey-timeline';
import { resolveJourneyState } from '@/features/journey/journey-state';
import { createClient } from '@/lib/supabase/server';

export default async function AppHomePage() {
  const { user, profile } = await getAuthState();
  const client = await createClient();
  const [currentPlan, assessments, examContext, targetResult] =
    await Promise.all([
    studyPlans.current().catch(() => null),
    assessmentHistory().catch(() => []),
    examIntelligenceContext().catch(() => null),
      user
        ? client
            .from('student_target_exams')
            .select('exam_edition_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
  const hasTargetExam = Boolean(targetResult.data?.exam_edition_id);
  const journey = resolveJourneyState({
    hasTargetExam,
    assessments,
    currentPlan,
  });
  const nextActivity = journey.mission.activity;
  const mentor = dominantMentor(nextActivity ? [nextActivity] : []);
  const targetExam = examContext?.availability === 'available'
    ? examContext.profile.displayName
    : hasTargetExam
      ? 'Sua prova escolhida'
      : 'Sua prova de residência';
  const firstName =
    profile?.display_name?.trim().split(/\s+/)[0] ?? 'estudante';
  const remainingStages = journey.steps.filter(
    (step) => step.status !== 'complete',
  ).length;

  return (
    <PageContainer>
      <main className="journey-home">
        <header className="journey-hero">
          <div>
            <p className="eyebrow">Sua jornada</p>
            <h1>Olá, {firstName}. Este é o seu próximo passo.</h1>
          </div>
          <div className="journey-goal" aria-label="Objetivo da preparação">
            <span>Seu objetivo</span>
            <strong>{targetExam}</strong>
            <small>
              {remainingStages} etapas visíveis até a revisão final da jornada
            </small>
          </div>
        </header>

        <JourneyTimeline steps={journey.steps} />

        <section
          aria-labelledby="journey-next-title"
          className="journey-next-step"
        >
          <div className="journey-next-copy">
            <p className="eyebrow">Agora</p>
            <h2 id="journey-next-title">{journey.mission.title}</h2>
            {nextActivity && (
              <p className="journey-time">
                Cerca de {nextActivity.estimatedMinutes} minutos
              </p>
            )}
            <div className="journey-why">
              <strong>Por que este passo?</strong>
              <p>{journey.mission.reason}</p>
            </div>
          </div>
          <div className="journey-mentor">
            <span>Mentor da área</span>
            <MentorIdentity mentor={mentor} />
            <p>
              Referência de {mentor.specialty} ao longo desta etapa. As
              recomendações vêm dos critérios pedagógicos do seu plano.
            </p>
          </div>
          <Link
            className="primary-button journey-primary-action"
            href={journey.mission.href}
          >
            {journey.mission.label}
          </Link>
        </section>

        <p className="journey-after">
          Depois desta atividade, sua jornada será atualizada com o próximo
          passo mais útil para sua preparação.
        </p>
      </main>
    </PageContainer>
  );
}

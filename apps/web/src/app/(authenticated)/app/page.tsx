import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { getAuthState } from '@/lib/auth';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import { assessmentHistory } from '@/features/assessments/server/adaptive-assessment';
import { activityReason } from '@/lib/learning-language';
import { dominantMentor } from '@/features/mentors/mentors';
import { MentorIdentity } from '@/features/mentors/components/mentor';
import { examIntelligenceContext } from '@/features/exam-intelligence/server/context';
import {
  JourneyTimeline,
  type JourneyStep,
} from '@/features/journey/components/journey-timeline';

export default async function AppHomePage() {
  const { profile } = await getAuthState();
  const [currentPlan, assessments, examContext] = await Promise.all([
    studyPlans.current().catch(() => null),
    assessmentHistory().catch(() => []),
    examIntelligenceContext().catch(() => null),
  ]);
  const nextActivity = currentPlan?.items.find((item) =>
    ['planned', 'in_progress'].includes(item.status),
  );
  const mentor = dominantMentor(nextActivity ? [nextActivity] : []);
  const hasCompletedDiagnostic = assessments.some(
    (assessment) => assessment.completedAt !== null,
  );
  const hasTargetExam = examContext?.availability === 'available';
  const targetExam = hasTargetExam
    ? examContext.profile.program.code
    : 'Sua prova de residência';
  const completedActivities =
    currentPlan?.items.filter((item) => item.status === 'completed').length ??
    0;
  const currentStage = nextActivity
    ? 'Fundamentos'
    : currentPlan && completedActivities > 0
      ? 'Consolidação'
      : hasCompletedDiagnostic
        ? 'Fundamentos'
        : hasTargetExam
          ? 'Diagnóstico'
          : 'Banca';
  const steps: JourneyStep[] = [
    { label: 'Perfil', status: 'complete' },
    {
      label: 'Banca',
      status: hasTargetExam
        ? 'complete'
        : currentStage === 'Banca'
          ? 'current'
          : 'upcoming',
    },
    {
      label: 'Diagnóstico',
      status: hasCompletedDiagnostic
        ? 'complete'
        : currentStage === 'Diagnóstico'
          ? 'current'
          : 'upcoming',
    },
    {
      label: 'Fundamentos',
      status:
        currentStage === 'Fundamentos'
          ? 'current'
          : completedActivities > 0
            ? 'complete'
            : 'upcoming',
    },
    {
      label: 'Consolidação',
      status: currentStage === 'Consolidação' ? 'current' : 'upcoming',
    },
    { label: 'Simulados', status: 'upcoming' },
    { label: 'Revisão final', status: 'upcoming' },
    { label: 'Pronto para a prova', status: 'upcoming' },
  ];
  const firstName =
    profile?.display_name?.trim().split(/\s+/)[0] ?? 'estudante';
  const nextTitle =
    nextActivity?.competencyName ??
    (hasCompletedDiagnostic
      ? 'Transformar seu diagnóstico em um plano'
      : 'Conhecer seu ponto de partida');
  const nextReason = nextActivity
    ? activityReason(nextActivity.reasons[0]?.code ?? '')
    : hasCompletedDiagnostic
      ? 'Seu diagnóstico já mostrou as primeiras prioridades. Agora vamos distribuí-las de acordo com sua rotina.'
      : 'Um diagnóstico curto mostra o que já está consistente e onde seu tempo de estudo pode fazer mais diferença.';
  const nextHref = nextActivity
    ? '/app/plan/today'
    : hasCompletedDiagnostic
      ? '/app/plan'
      : '/app/assessment/start';
  const nextLabel = nextActivity
    ? nextActivity.status === 'in_progress'
      ? 'Retomar atividade'
      : 'Começar atividade'
    : hasCompletedDiagnostic
      ? 'Criar meu plano'
      : 'Começar diagnóstico';
  const remainingStages = steps.filter(
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

        <JourneyTimeline steps={steps} />

        <section
          aria-labelledby="journey-next-title"
          className="journey-next-step"
        >
          <div className="journey-next-copy">
            <p className="eyebrow">Agora</p>
            <h2 id="journey-next-title">{nextTitle}</h2>
            {nextActivity && (
              <p className="journey-time">
                Cerca de {nextActivity.estimatedMinutes} minutos
              </p>
            )}
            <div className="journey-why">
              <strong>Por que este passo?</strong>
              <p>{nextReason}</p>
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
            href={nextHref}
          >
            {nextLabel}
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

import type {
  AssessmentSummary,
  StudyPlan,
  StudyPlanItem,
} from '@iatron/contracts';
import type { Route } from 'next';
import type { JourneyStep } from './components/journey-timeline';
import { activityReason } from '@/lib/learning-language';

interface JourneyStateInput {
  hasTargetExam: boolean;
  assessments: AssessmentSummary[];
  currentPlan: StudyPlan | null;
}

interface JourneyMission {
  title: string;
  reason: string;
  href: Route;
  label: string;
  activity: StudyPlanItem | null;
}

export interface JourneyState {
  steps: JourneyStep[];
  mission: JourneyMission;
  activeAssessment: AssessmentSummary | null;
  hasCompletedDiagnostic: boolean;
}

const byNewest = (left: AssessmentSummary, right: AssessmentSummary) =>
  Date.parse(right.startedAt) - Date.parse(left.startedAt);

export function resolveJourneyState({
  hasTargetExam,
  assessments,
  currentPlan,
}: JourneyStateInput): JourneyState {
  const completedAssessment =
    assessments
      .filter(
        (assessment) =>
          assessment.status === 'completed' ||
          assessment.completedAt !== null,
      )
      .sort(byNewest)[0] ?? null;
  const newestOpenAssessment =
    assessments
      .filter(
        (assessment) =>
          assessment.status !== 'completed' &&
          assessment.completedAt === null,
      )
      .sort(byNewest)[0] ?? null;
  const activeAssessment =
    newestOpenAssessment &&
    (!completedAssessment ||
      Date.parse(newestOpenAssessment.startedAt) >
        Date.parse(completedAssessment.completedAt ?? completedAssessment.startedAt))
      ? newestOpenAssessment
      : null;
  const hasCompletedDiagnostic = completedAssessment !== null;
  const nextActivity =
    currentPlan?.items.find((item) =>
      ['planned', 'in_progress'].includes(item.status),
    ) ?? null;
  const completedActivities =
    currentPlan?.items.filter((item) => item.status === 'completed').length ??
    0;

  const currentStage = !hasTargetExam
    ? 'Banca'
    : activeAssessment
      ? 'Diagnóstico'
      : !hasCompletedDiagnostic
        ? 'Diagnóstico'
        : nextActivity || completedActivities === 0
          ? 'Fundamentos'
          : 'Consolidação';
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
      status: activeAssessment
        ? 'current'
        : hasCompletedDiagnostic
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

  let mission: JourneyMission;
  if (!hasTargetExam) {
    mission = {
      title: 'Escolher sua prova-alvo',
      reason:
        'Sua prova orienta os próximos passos e ajuda a concentrar seu tempo no que mais importa.',
      href: '/app/onboarding',
      label: 'Escolher minha prova',
      activity: null,
    };
  } else if (activeAssessment) {
    mission = {
      title: 'Continuar seu diagnóstico',
      reason:
        'Suas respostas anteriores estão salvas. Continue de onde parou para concluirmos seu retrato inicial.',
      href: `/app/assessment/session?id=${activeAssessment.id}` as Route,
      label: 'Continuar diagnóstico',
      activity: null,
    };
  } else if (nextActivity) {
    mission = {
      title: nextActivity.competencyName,
      reason: activityReason(nextActivity.reasons[0]?.code ?? ''),
      href: '/app/plan/today',
      label:
        nextActivity.status === 'in_progress'
          ? 'Retomar atividade'
          : 'Começar atividade',
      activity: nextActivity,
    };
  } else if (hasCompletedDiagnostic && !currentPlan) {
    mission = {
      title: 'Transformar seu diagnóstico em um plano',
      reason:
        'Seu diagnóstico já mostrou as primeiras prioridades. Agora vamos distribuí-las de acordo com sua rotina.',
      href: '/app/plan',
      label: 'Criar meu plano',
      activity: null,
    };
  } else if (hasCompletedDiagnostic) {
    mission = {
      title: 'Revisar seu progresso',
      reason:
        'As atividades previstas foram concluídas. Veja sua evolução e prepare o próximo passo.',
      href: '/app/plan/week',
      label: 'Ver meu plano',
      activity: null,
    };
  } else {
    mission = {
      title: 'Conhecer seu ponto de partida',
      reason:
        'Um diagnóstico curto mostra o que já está consistente e onde seu tempo de estudo pode fazer mais diferença.',
      href: '/app/assessment/start',
      label: 'Começar diagnóstico',
      activity: null,
    };
  }

  return {
    steps,
    mission,
    activeAssessment,
    hasCompletedDiagnostic,
  };
}

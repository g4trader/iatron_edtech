import type {
  AssessmentSummary,
  StudyPlan,
  StudyPlanItem,
} from '@iatron/contracts';
import type { Route } from 'next';
import type { JourneyStep } from './components/journey-timeline';
import { selectAssessmentEntry } from '@/features/assessments/entry-state';
import { activityReason } from '@/lib/learning-language';

interface JourneyStateInput {
  hasTargetExam: boolean;
  profileComplete?: boolean;
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
  completedSteps: string[];
  currentStep: string;
  nextAction: string;
  nextActionReason: string;
  targetExamState: 'missing' | 'selected';
  assessmentState: 'not_started' | 'in_progress' | 'completed';
  planState: 'missing' | 'available' | 'completed' | 'empty';
  dataFreshness: 'fresh';
}

export function resolveJourneyState({
  hasTargetExam,
  assessments,
  currentPlan,
  profileComplete = true,
}: JourneyStateInput): JourneyState {
  const { current: activeAssessment, completed: completedAssessment } =
    selectAssessmentEntry(assessments);
  const hasCompletedDiagnostic = completedAssessment !== null;
  const nextActivity =
    currentPlan?.items.find((item) =>
      ['planned', 'in_progress'].includes(item.status),
    ) ?? null;
  // Navigation milestones only. Clinical mastery/readiness remain backend decisions.
  const currentStage = !profileComplete
    ? 'Perfil'
    : !hasTargetExam
      ? 'Prova'
      : activeAssessment || !hasCompletedDiagnostic
        ? 'Diagnóstico'
        : 'Estudos';
  const steps: JourneyStep[] = [
    { label: 'Perfil', status: profileComplete ? 'complete' : 'current' },
    {
      label: 'Prova',
      status: hasTargetExam
        ? 'complete'
        : currentStage === 'Prova'
          ? 'current'
          : 'upcoming',
    },
    {
      label: 'Diagnóstico',
      status:
        currentStage === 'Diagnóstico'
          ? 'current'
          : hasCompletedDiagnostic
            ? 'complete'
            : 'upcoming',
    },
    {
      label: 'Estudos',
      status: currentStage === 'Estudos' ? 'current' : 'upcoming',
    },
  ];

  let mission: JourneyMission;
  if (!profileComplete) {
    mission = {
      title: 'Complete seu perfil',
      reason:
        'Conte sua rotina para organizar uma preparação que caiba no seu dia.',
      href: '/app/onboarding',
      label: 'Continuar meu cadastro',
      activity: null,
    };
  } else if (!hasTargetExam) {
    mission = {
      title: 'Escolha sua prova de residência',
      reason:
        'Sua prova orienta os próximos passos e ajuda a concentrar seu tempo no que mais importa.',
      href: '/app/exams',
      label: 'Escolher minha prova',
      activity: null,
    };
  } else if (activeAssessment) {
    mission = {
      title: 'Continue seu diagnóstico',
      reason:
        'Suas respostas anteriores estão salvas. Continue de onde parou para concluirmos seu retrato inicial.',
      href: '/app/assessment/entry',
      label: 'Retomar diagnóstico',
      activity: null,
    };
  } else if (hasCompletedDiagnostic && nextActivity) {
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
      title: 'Confira seu resultado',
      reason:
        'Seu diagnóstico já mostrou as primeiras prioridades. Agora vamos distribuí-las de acordo com sua rotina.',
      href: `/app/assessment/result?id=${completedAssessment!.id}` as Route,
      label: 'Ver meu diagnóstico',
      activity: null,
    };
  } else if (hasCompletedDiagnostic) {
    mission = {
      title: currentPlan?.items.length
        ? 'Continue sua preparação'
        : 'Confira sua trilha',
      reason:
        'Veja as atividades e os próximos passos disponíveis no seu plano. A conclusão dos estudos não representa, por si só, prontidão para a prova.',
      href: '/app/plan/week',
      label: 'Ver meu plano',
      activity: null,
    };
  } else {
    mission = {
      title: 'Descubra seu ponto de partida',
      reason:
        'Um diagnóstico curto mostra o que já está consistente e onde seu tempo de estudo pode fazer mais diferença.',
      href: '/app/assessment/entry',
      label: 'Iniciar diagnóstico',
      activity: null,
    };
  }

  return {
    steps,
    mission,
    activeAssessment,
    hasCompletedDiagnostic,
    completedSteps: steps
      .filter(({ status }) => status === 'complete')
      .map(({ label }) => label),
    currentStep:
      steps.find(({ status }) => status === 'current')?.label ?? 'Concluído',
    nextAction: mission.label,
    nextActionReason: mission.reason,
    targetExamState: hasTargetExam ? 'selected' : 'missing',
    assessmentState: activeAssessment
      ? 'in_progress'
      : hasCompletedDiagnostic
        ? 'completed'
        : 'not_started',
    planState: !currentPlan
      ? 'missing'
      : currentPlan.items.length === 0
        ? 'empty'
        : nextActivity
          ? 'available'
          : 'completed',
    dataFreshness: 'fresh',
  };
}

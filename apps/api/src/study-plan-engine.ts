import type { LearningGap, StudyPlanReason } from '@iatron/contracts';

export const STUDY_PLAN_ALGORITHM_VERSION = 'study-plan-v1';

export interface Availability {
  weekday: number;
  minutesAvailable: number;
}

export interface TargetExam {
  id: string;
  applicationDate: string | null;
  relevantCompetencyIds: string[];
}

export interface PlanHistory {
  competencyId: string;
  deferredCount: number;
  completedCount?: number;
  skippedCount?: number;
}

export interface PlannedRecommendation {
  competencyId: string;
  itemType:
    | 'competency_study'
    | 'review'
    | 'question_practice'
    | 'gap_reinforcement'
    | 'complementary_diagnosis';
  priority: number;
  estimatedMinutes: number;
  plannedDate: string | null;
  position: number | null;
  status: 'planned' | 'unallocated';
  origin: string;
  justification: { reasons: StudyPlanReason[]; unallocatedReason?: string };
  sourceSnapshot: Record<string, unknown>;
  replanCount: number;
}

const rounded = (value: number) => Math.round(value * 100_000) / 100_000;
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function prioritizeStudyRecommendations(input: {
  gaps: LearningGap[];
  targetExam: TargetExam | null;
  history: PlanHistory[];
  asOf: Date;
}) {
  const relevant = new Set(input.targetExam?.relevantCompetencyIds ?? []);
  const examDays = input.targetExam?.applicationDate
    ? Math.ceil(
        (Date.parse(input.targetExam.applicationDate) - input.asOf.getTime()) /
          86_400_000,
      )
    : null;
  return input.gaps
    .map((gap) => {
      const reasons: StudyPlanReason[] = [];
      const add = (code: string, contribution: number, detail: string) => {
        if (contribution > 0) reasons.push({ code, contribution, detail });
      };
      add(
        'gap_priority',
        gap.priority * 0.45,
        'Prioridade produzida pelo Learning Gap Engine.',
      );
      add(
        'low_mastery',
        (1 - gap.mastery) * 0.2,
        `Mastery atual: ${Math.round(gap.mastery * 100)}%.`,
      );
      add(
        'low_confidence',
        (1 - gap.confidence) * 0.1,
        `Confiança atual: ${Math.round(gap.confidence * 100)}%.`,
      );
      add(
        'negative_trend',
        gap.trend === 'declining' ? 0.05 : 0,
        'Tendência de mastery negativa.',
      );
      add(
        'forgotten',
        gap.reasons.includes('forgotten') ? 0.05 : 0,
        'Evidência mais recente está antiga.',
      );
      add(
        'unmeasured',
        gap.evidenceCount === 0 ? 0.05 : 0,
        'Competência ainda não avaliada.',
      );
      add(
        'target_exam_relevance',
        relevant.has(gap.competencyId) ? 0.05 : 0,
        'Competência relacionada à prova-alvo.',
      );
      add(
        'exam_proximity',
        examDays !== null && examDays >= 0 && examDays <= 180
          ? rounded(((180 - examDays) / 180) * 0.05)
          : 0,
        `Prova-alvo em ${examDays ?? 'prazo não informado'} dias.`,
      );
      const deferredCount =
        input.history.find((item) => item.competencyId === gap.competencyId)
          ?.deferredCount ?? 0;
      add(
        'previously_deferred',
        Math.min(0.05, deferredCount * 0.02),
        `Item adiado ${deferredCount} vez(es).`,
      );
      const history = input.history.find(
        (item) => item.competencyId === gap.competencyId,
      );
      add(
        'previously_skipped',
        Math.min(0.03, (history?.skippedCount ?? 0) * 0.01),
        `Item pulado ${history?.skippedCount ?? 0} vez(es).`,
      );
      if ((history?.completedCount ?? 0) > 0)
        reasons.push({
          code: 'recently_completed',
          contribution: 0,
          detail: 'Competência já executada no histórico recente.',
        });
      const priority = rounded(
        Math.max(
          0,
          Math.min(
            1,
            reasons.reduce((total, reason) => total + reason.contribution, 0) -
              ((history?.completedCount ?? 0) > 0 ? 0.15 : 0),
          ),
        ),
      );
      const itemType =
        gap.evidenceCount === 0
          ? ('complementary_diagnosis' as const)
          : gap.reasons.includes('critical')
            ? ('gap_reinforcement' as const)
            : gap.reasons.includes('forgotten')
              ? ('review' as const)
              : gap.confidence < 0.4
                ? ('question_practice' as const)
                : ('competency_study' as const);
      return { gap, reasons, priority, itemType, deferredCount };
    })
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        left.gap.competencyCode.localeCompare(right.gap.competencyCode),
    );
}

export function generateSevenDayPlan(input: {
  gaps: LearningGap[];
  availability: Availability[];
  preferredSessionMinutes: number;
  targetExam: TargetExam | null;
  history: PlanHistory[];
  asOf: Date;
  horizonDays: number;
}): {
  items: PlannedRecommendation[];
  totalAvailableMinutes: number;
  availabilitySnapshot: Array<{
    date: string;
    weekday: number;
    minutesAvailable: number;
  }>;
} {
  const byWeekday = new Map(
    input.availability.map((item) => [item.weekday, item.minutesAvailable]),
  );
  const days = Array.from({ length: input.horizonDays }, (_, offset) => {
    const date = new Date(input.asOf);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() + offset);
    return {
      date: isoDate(date),
      weekday: date.getUTCDay(),
      minutesAvailable: byWeekday.get(date.getUTCDay()) ?? 0,
      remaining: byWeekday.get(date.getUTCDay()) ?? 0,
      position: 0,
    };
  });
  const recommendations = prioritizeStudyRecommendations({
    gaps: input.gaps,
    targetExam: input.targetExam,
    history: input.history,
    asOf: input.asOf,
  });
  const items = recommendations.map<PlannedRecommendation>(
    ({ gap, reasons, priority, itemType, deferredCount }) => {
      const desired = Math.max(
        15,
        Math.min(
          input.preferredSessionMinutes,
          priority >= 0.8 ? 45 : priority >= 0.6 ? 30 : 20,
        ),
      );
      const day = days.find((candidate) => candidate.remaining >= 15);
      if (!day)
        return {
          competencyId: gap.competencyId,
          itemType,
          priority,
          estimatedMinutes: desired,
          plannedDate: null,
          position: null,
          status: 'unallocated',
          origin: 'learning-gap-engine',
          justification: {
            reasons,
            unallocatedReason: 'insufficient_availability',
          },
          sourceSnapshot: {
            mastery: gap.mastery,
            confidence: gap.confidence,
            evidenceCount: gap.evidenceCount,
            trend: gap.trend,
            gapReasons: gap.reasons,
          },
          replanCount: Math.min(3, deferredCount),
        };
      const allocated = Math.min(desired, day.remaining);
      day.remaining -= allocated;
      day.position += 1;
      return {
        competencyId: gap.competencyId,
        itemType,
        priority,
        estimatedMinutes: allocated,
        plannedDate: day.date,
        position: day.position,
        status: 'planned',
        origin: 'learning-gap-engine',
        justification: { reasons },
        sourceSnapshot: {
          mastery: gap.mastery,
          confidence: gap.confidence,
          evidenceCount: gap.evidenceCount,
          trend: gap.trend,
          gapReasons: gap.reasons,
        },
        replanCount: Math.min(3, deferredCount),
      };
    },
  );
  return {
    items,
    totalAvailableMinutes: days.reduce(
      (total, day) => total + day.minutesAvailable,
      0,
    ),
    availabilitySnapshot: days.map(({ date, weekday, minutesAvailable }) => ({
      date,
      weekday,
      minutesAvailable,
    })),
  };
}

import type {
  LearningEvidence,
  LearningGap,
  LearningTimelineItem,
  MasteryState,
  ScheduleItem,
} from '@iatron/contracts';

export const LEARNING_ALGORITHM_VERSION = 'mastery-v1';
export const EVIDENCE_ALGORITHM_VERSION = 'evidence-v1';

export interface CompetencyIdentity {
  id: string;
  code: string;
  name: string;
}

export interface QuestionAnsweredEvent {
  id: string;
  studentId: string;
  type: 'QuestionAnswered';
  occurredAt: string;
  outcomes: Array<{
    competency: CompetencyIdentity;
    weight: number;
    difficulty: number;
    responseTimeMs: number | null;
    isCorrect: boolean;
  }>;
}

export function deriveEvidence(
  event: QuestionAnsweredEvent,
): LearningEvidence[] {
  return event.outcomes.map((outcome) => ({
    id: crypto.randomUUID(),
    eventId: event.id,
    competencyId: outcome.competency.id,
    competencyCode: outcome.competency.code,
    competencyName: outcome.competency.name,
    weight: outcome.weight,
    difficulty: outcome.difficulty,
    responseTimeMs: outcome.responseTimeMs,
    isCorrect: outcome.isCorrect,
    observedAt: event.occurredAt,
    algorithmVersion: EVIDENCE_ALGORITHM_VERSION,
  }));
}

const rounded = (value: number) => Math.round(value * 100_000) / 100_000;
const score = (evidence: LearningEvidence) => (evidence.isCorrect ? 1 : 0);
const adjustedWeight = (evidence: LearningEvidence) =>
  evidence.weight * (0.75 + evidence.difficulty * 0.05);

export function calculateMastery(
  competencies: CompetencyIdentity[],
  evidence: LearningEvidence[],
): MasteryState[] {
  return competencies
    .flatMap<MasteryState>((competency) => {
      const items = evidence
        .filter((item) => item.competencyId === competency.id)
        .sort(
          (left, right) =>
            Date.parse(left.observedAt) - Date.parse(right.observedAt) ||
            left.id.localeCompare(right.id),
        );
      if (items.length === 0) return [];
      const denominator = items.reduce(
        (total, item) => total + adjustedWeight(item),
        0,
      );
      const mastery =
        items.reduce(
          (total, item) => total + score(item) * adjustedWeight(item),
          0,
        ) / denominator;
      const latest = items.at(-1)!;
      const previous = items.slice(-5, -1);
      const previousScore = previous.length
        ? previous.reduce((total, item) => total + score(item), 0) /
          previous.length
        : score(latest);
      const delta = score(latest) - previousScore;
      return [
        {
          competencyId: competency.id,
          competencyCode: competency.code,
          competencyName: competency.name,
          mastery: rounded(mastery),
          confidence: rounded(Math.min(1, items.length / 5)),
          evidenceCount: items.length,
          trend:
            Math.abs(delta) < 0.15
              ? ('stable' as const)
              : delta > 0
                ? ('improving' as const)
                : ('declining' as const),
          lastEvidenceAt: latest.observedAt,
          algorithmVersion: LEARNING_ALGORITHM_VERSION,
        },
      ];
    })
    .sort((left, right) =>
      left.competencyCode.localeCompare(right.competencyCode),
    );
}

export function identifyLearningGaps(
  competencies: CompetencyIdentity[],
  mastery: MasteryState[],
  asOf: Date,
): LearningGap[] {
  return competencies
    .map((competency) => {
      const state = mastery.find(
        (item) => item.competencyId === competency.id,
      ) ?? {
        competencyId: competency.id,
        competencyCode: competency.code,
        competencyName: competency.name,
        mastery: 0,
        confidence: 0,
        evidenceCount: 0,
        trend: 'stable' as const,
        lastEvidenceAt: null,
        algorithmVersion: LEARNING_ALGORITHM_VERSION,
      };
      const ageDays = state.lastEvidenceAt
        ? (asOf.getTime() - Date.parse(state.lastEvidenceAt)) / 86_400_000
        : Number.POSITIVE_INFINITY;
      const reasons: string[] = [];
      if (state.mastery < 0.5 && state.confidence >= 0.4)
        reasons.push('critical');
      if (ageDays > 30 && state.evidenceCount > 0) reasons.push('forgotten');
      if (state.evidenceCount < 3) reasons.push('low_evidence');
      const priority = rounded(
        Math.min(
          1,
          (1 - state.mastery) * 0.55 +
            (1 - state.confidence) * 0.25 +
            (reasons.includes('forgotten') ? 0.15 : 0) +
            (reasons.includes('critical') ? 0.05 : 0),
        ),
      );
      return { ...state, reasons, priority };
    })
    .filter((gap) => gap.reasons.length > 0)
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        left.competencyCode.localeCompare(right.competencyCode),
    );
}

export function buildDailySchedule(
  gaps: LearningGap[],
  limit = 10,
): ScheduleItem[] {
  return gaps.slice(0, limit).map((gap, index) => ({
    ...gap,
    rank: index + 1,
    recommendedMinutes:
      gap.priority >= 0.8 ? 45 : gap.priority >= 0.6 ? 30 : 20,
  }));
}

export function buildTimeline(items: LearningTimelineItem[]) {
  return [...items].sort(
    (left, right) =>
      Date.parse(right.occurredAt) - Date.parse(left.occurredAt) ||
      right.id.localeCompare(left.id),
  );
}

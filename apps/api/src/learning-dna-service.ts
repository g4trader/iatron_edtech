import { createHash } from 'node:crypto';
import type {
  LearningDnaIndicator,
  LearningDnaSnapshot,
} from '@iatron/contracts';

export const LEARNING_DNA_POLICY = {
  version: 'learning-dna-policy-v1-synthetic',
  algorithmVersion: 'learning-dna-v1',
  minimumComparableEvents: 4,
  minimumTimedEvents: 3,
  minimumCalibrationEvents: 4,
  recurringErrorCount: 2,
  retentionIntervalDays: 7,
  speedTolerance: 0.2,
  consistencyVariation: 0.25,
} as const;

export interface LearningDnaObservation {
  id: string;
  studentId: string;
  occurredAt: string;
  competencyId: string;
  areaId: string | null;
  themeId: string | null;
  subthemeId: string | null;
  difficulty: number;
  isCorrect: boolean;
  responseTimeMs: number | null;
  statedConfidence: string | null;
  origin: string;
}

export interface LearningDnaReview {
  id: string;
  studentId: string;
  competencyId: string;
  occurredAt: string;
}

export interface LearningDnaPolicy {
  version: string;
  algorithmVersion: string;
  minimumComparableEvents: number;
  minimumTimedEvents: number;
  minimumCalibrationEvents: number;
  recurringErrorCount: number;
  retentionIntervalDays: number;
  speedTolerance: number;
  consistencyVariation: number;
}

export type LearningDnaScope =
  | { type: 'global'; id: null }
  | { type: 'area'; id: string }
  | { type: 'competency'; id: string };

const rounded = (value: number) => Math.round(value * 100_000) / 100_000;
const declared = (value: string | null) =>
  value === 'high'
    ? 'certain'
    : value === 'low' || value === 'medium'
      ? 'uncertain'
      : value;

export function formatLearningDnaIndicator(
  type: LearningDnaIndicator['type'],
  state: string,
): string {
  if (state === 'insufficient_evidence')
    return 'Ainda não há atividades suficientes para identificar um padrão confiável.';
  const messages: Record<string, string> = {
    stable:
      'Seu desempenho neste conteúdo tem se mantido estável nas últimas atividades.',
    variable:
      'Seu desempenho variou nas atividades recentes. Vamos observar novas respostas antes de concluir um padrão.',
    faster_than_own_baseline:
      'Nas atividades recentes, você respondeu mais rapidamente do que no seu próprio histórico comparável.',
    within_own_baseline:
      'Seu tempo de resposta permaneceu próximo do seu próprio histórico comparável.',
    slower_than_own_baseline:
      'Seu tempo de resposta ficou acima do seu histórico recente. Isso, isoladamente, não indica falta de conhecimento.',
    well_calibrated:
      'Sua segurança declarada tem acompanhado os resultados observados nas atividades recentes.',
    possible_overconfidence:
      'Em algumas respostas, sua confiança foi maior do que o resultado observado. Precisamos de mais evidências antes de concluir um padrão.',
    possible_underconfidence:
      'Em algumas respostas corretas, você demonstrou pouca segurança. Novas atividades ajudarão a confirmar esse padrão.',
    recurring_gap:
      'O mesmo conteúdo apareceu em mais de um erro recente e merece uma revisão dirigida.',
    isolated_error:
      'Há um erro isolado neste conteúdo; ainda não existe repetição suficiente para indicar um padrão.',
    retained:
      'Você manteve o desempenho ao retomar este conteúdo após alguns dias.',
    unstable_retention:
      'O desempenho mudou ao retomar este conteúdo. Novas revisões ajudarão a avaliar a retenção.',
    improved_after_review:
      'Seu desempenho melhorou depois da revisão deste conteúdo.',
    unchanged_after_review:
      'Seu desempenho permaneceu semelhante depois da revisão.',
    declined_after_review:
      'O resultado após a revisão ainda não mostrou melhora. Vale retomar os fundamentos.',
  };
  return (
    messages[state] ??
    (type === 'knowledge_stability'
      ? 'Ainda estamos acompanhando como esse conhecimento se mantém ao longo do tempo.'
      : 'Este padrão foi observado nas atividades recentes.')
  );
}

const indicator = (
  type: LearningDnaIndicator['type'],
  state: string,
  observations: LearningDnaObservation[],
  rule: string,
  limitations: string[],
  policy: LearningDnaPolicy,
): LearningDnaIndicator => ({
  type,
  state,
  eventCount: observations.length,
  periodStart: observations[0]?.occurredAt ?? null,
  periodEnd: observations.at(-1)?.occurredAt ?? null,
  competencyIds: [
    ...new Set(observations.map((item) => item.competencyId)),
  ].sort(),
  areaIds: [
    ...new Set(
      observations.flatMap((item) => (item.areaId ? [item.areaId] : [])),
    ),
  ].sort(),
  sufficient: state !== 'insufficient_evidence',
  rule,
  limitations,
  algorithmVersion: policy.algorithmVersion,
  message: formatLearningDnaIndicator(type, state),
});

export function calculateLearningDna(input: {
  studentId: string;
  observations: LearningDnaObservation[];
  reviews?: LearningDnaReview[];
  scope?: LearningDnaScope;
  windowStart?: string;
  windowEnd?: string;
  policy?: LearningDnaPolicy;
  calculatedAt: string;
}): LearningDnaSnapshot {
  const policy = input.policy ?? LEARNING_DNA_POLICY;
  const scope = input.scope ?? { type: 'global', id: null };
  const observations = input.observations
    .filter((item) => item.studentId === input.studentId)
    .filter(
      (item) =>
        (!input.windowStart || item.occurredAt >= input.windowStart) &&
        (!input.windowEnd || item.occurredAt <= input.windowEnd) &&
        (scope.type === 'global' ||
          (scope.type === 'area' && item.areaId === scope.id) ||
          (scope.type === 'competency' && item.competencyId === scope.id)),
    )
    .sort(
      (left, right) =>
        left.occurredAt.localeCompare(right.occurredAt) ||
        left.id.localeCompare(right.id),
    );
  const reviews = (input.reviews ?? [])
    .filter(
      (item) =>
        item.studentId === input.studentId &&
        (scope.type !== 'competency' || item.competencyId === scope.id),
    )
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
  const commonLimitations = [
    'Parâmetros sintéticos pendentes de validação pedagógica e estatística.',
  ];

  const scores = observations.map((item) => Number(item.isCorrect));
  const mean = scores.length
    ? scores.reduce((total, value) => total + value, 0) / scores.length
    : 0;
  const variation = scores.length
    ? Math.sqrt(
        scores.reduce((total, value) => total + (value - mean) ** 2, 0) /
          scores.length,
      )
    : 0;
  const consistencyState =
    observations.length < policy.minimumComparableEvents
      ? 'insufficient_evidence'
      : variation <= policy.consistencyVariation
        ? 'stable'
        : 'variable';

  const timed = observations.filter(
    (item) =>
      item.responseTimeMs !== null &&
      item.responseTimeMs >= 1_000 &&
      item.responseTimeMs <= 900_000,
  );
  const latestTimed = timed.at(-1);
  const baseline = timed.slice(0, -1);
  const baselineMean = baseline.length
    ? baseline.reduce((total, item) => total + item.responseTimeMs!, 0) /
      baseline.length
    : 0;
  const speedState =
    timed.length < policy.minimumTimedEvents || baselineMean === 0
      ? 'insufficient_evidence'
      : latestTimed!.responseTimeMs! <
          baselineMean * (1 - policy.speedTolerance)
        ? 'faster_than_own_baseline'
        : latestTimed!.responseTimeMs! >
            baselineMean * (1 + policy.speedTolerance)
          ? 'slower_than_own_baseline'
          : 'within_own_baseline';

  const calibrated = observations.filter(
    (item) => declared(item.statedConfidence) !== null,
  );
  const certainErrors = calibrated.filter(
    (item) => declared(item.statedConfidence) === 'certain' && !item.isCorrect,
  ).length;
  const uncertainCorrect = calibrated.filter(
    (item) =>
      ['uncertain', 'do_not_know'].includes(
        declared(item.statedConfidence) ?? '',
      ) && item.isCorrect,
  ).length;
  const calibrationState =
    calibrated.length < policy.minimumCalibrationEvents
      ? 'insufficient_evidence'
      : certainErrors >= 2
        ? 'possible_overconfidence'
        : uncertainCorrect >= 2
          ? 'possible_underconfidence'
          : 'well_calibrated';

  const errors = observations.filter((item) => !item.isCorrect);
  const errorGroups = new Map<string, number>();
  for (const item of errors)
    for (const key of [
      `competency:${item.competencyId}`,
      item.themeId ? `theme:${item.themeId}` : null,
      item.subthemeId ? `subtheme:${item.subthemeId}` : null,
    ])
      if (key) errorGroups.set(key, (errorGroups.get(key) ?? 0) + 1);
  const recurrenceState =
    observations.length < 2
      ? 'insufficient_evidence'
      : [...errorGroups.values()].some(
            (count) => count >= policy.recurringErrorCount,
          )
        ? 'recurring_gap'
        : errors.length > 0
          ? 'isolated_error'
          : 'insufficient_evidence';

  const retentionPairs = observations.flatMap((current, index) =>
    observations.slice(index + 1).flatMap((later) => {
      const days =
        (Date.parse(later.occurredAt) - Date.parse(current.occurredAt)) /
        86_400_000;
      return later.competencyId === current.competencyId &&
        days >= policy.retentionIntervalDays
        ? [{ current, later }]
        : [];
    }),
  );
  const retentionState =
    retentionPairs.length === 0
      ? 'insufficient_evidence'
      : retentionPairs.every(
            ({ current, later }) => !current.isCorrect || later.isCorrect,
          )
        ? 'retained'
        : 'unstable_retention';

  const reviewComparisons = reviews.flatMap((review) => {
    const before = observations
      .filter(
        (item) =>
          item.competencyId === review.competencyId &&
          item.occurredAt < review.occurredAt,
      )
      .at(-1);
    const after = observations.find(
      (item) =>
        item.competencyId === review.competencyId &&
        item.occurredAt > review.occurredAt,
    );
    return before && after ? [{ before, after }] : [];
  });
  const reviewDelta = reviewComparisons.reduce(
    (total, pair) =>
      total + Number(pair.after.isCorrect) - Number(pair.before.isCorrect),
    0,
  );
  const reviewState =
    reviewComparisons.length === 0
      ? 'insufficient_evidence'
      : reviewDelta > 0
        ? 'improved_after_review'
        : reviewDelta < 0
          ? 'declined_after_review'
          : 'unchanged_after_review';

  const stabilityState =
    observations.length < policy.minimumComparableEvents
      ? 'insufficient_evidence'
      : retentionState === 'retained' && consistencyState === 'stable'
        ? 'stable'
        : 'variable';
  const indicators = [
    indicator(
      'consistency',
      consistencyState,
      observations,
      `minimum=${policy.minimumComparableEvents};variation<=${policy.consistencyVariation}`,
      commonLimitations,
      policy,
    ),
    indicator(
      'observed_speed',
      speedState,
      timed,
      `own_baseline;minimum=${policy.minimumTimedEvents};tolerance=${policy.speedTolerance}`,
      timed.length === observations.length
        ? commonLimitations
        : [
            ...commonLimitations,
            'Tempos ausentes ou inválidos foram ignorados.',
          ],
      policy,
    ),
    indicator(
      'calibrated_safety',
      calibrationState,
      calibrated,
      `minimum=${policy.minimumCalibrationEvents};repeated_mismatch=2`,
      calibrated.length === observations.length
        ? commonLimitations
        : [
            ...commonLimitations,
            'Respostas sem segurança declarada não foram usadas neste indicador.',
          ],
      policy,
    ),
    indicator(
      'recurring_error',
      recurrenceState,
      observations,
      `same_dimension_errors>=${policy.recurringErrorCount}`,
      commonLimitations,
      policy,
    ),
    indicator(
      'retention',
      retentionState,
      observations,
      `comparable_interval_days>=${policy.retentionIntervalDays}`,
      commonLimitations,
      policy,
    ),
    indicator(
      'review_response',
      reviewState,
      observations,
      'comparable_attempt_before_and_after_review',
      commonLimitations,
      policy,
    ),
    indicator(
      'knowledge_stability',
      stabilityState,
      observations,
      'consistency_and_retention',
      commonLimitations,
      policy,
    ),
  ] satisfies LearningDnaIndicator[];
  const sufficientCount = indicators.filter((item) => item.sufficient).length;
  const serialized = observations.map((item) => ({
    id: item.id,
    occurredAt: item.occurredAt,
    competencyId: item.competencyId,
    areaId: item.areaId,
    themeId: item.themeId,
    subthemeId: item.subthemeId,
    difficulty: item.difficulty,
    isCorrect: item.isCorrect,
    responseTimeMs: item.responseTimeMs,
    statedConfidence: item.statedConfidence,
    origin: item.origin,
  }));
  return {
    id: null,
    studentId: input.studentId,
    scopeType: scope.type,
    scopeId: scope.id,
    windowStart: observations[0]?.occurredAt ?? null,
    windowEnd: observations.at(-1)?.occurredAt ?? null,
    calculatedAt: input.calculatedAt,
    algorithmVersion: policy.algorithmVersion,
    policyVersion: policy.version,
    evidenceCount: observations.length,
    coverage: rounded(
      new Set(
        observations.flatMap((item) => (item.areaId ? [item.areaId] : [])),
      ).size / 5,
    ),
    indicators,
    limitations: commonLimitations,
    sufficiency:
      sufficientCount >= 5
        ? 'sufficient'
        : sufficientCount > 0
          ? 'partial'
          : 'insufficient',
    eventOrigins: [...new Set(observations.map((item) => item.origin))].sort(),
    sourceHash: createHash('sha256')
      .update(JSON.stringify(serialized))
      .digest('hex'),
  };
}

export function toLearningDnaContext(snapshot: LearningDnaSnapshot) {
  return {
    sufficiency: snapshot.sufficiency,
    indicators: snapshot.indicators.map(({ type, state, message }) => ({
      type,
      state,
      message,
    })),
    limitations: snapshot.limitations,
    sourceHash: snapshot.sourceHash,
  };
}

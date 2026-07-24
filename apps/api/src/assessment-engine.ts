import type { MasteryState } from '@iatron/contracts';

export interface AssessmentCandidate {
  questionVersionId: string;
  difficulty: number;
  themeIds: string[];
  competencyIds: string[];
  areaIds: string[];
  examRelevance?: number;
}

export interface AssessmentSelection {
  candidate: AssessmentCandidate;
  score: number;
  reason: string;
}

export type DeclaredSafety =
  | 'certain'
  | 'uncertain'
  | 'do_not_know'
  | 'low'
  | 'medium'
  | 'high'
  | null;

export type DiagnosticEvidenceSignal =
  | 'evidence_of_consolidation'
  | 'explicit_gap'
  | 'uncertain_knowledge'
  | 'possible_miscalibration'
  | 'insufficient_evidence';

export interface DiagnosticObservation {
  questionVersionId: string;
  areaIds: string[];
  competencyIds: string[];
  difficulty: number;
  isCorrect: boolean;
  statedConfidence: DeclaredSafety;
  responseTimeMs?: number;
  evidenceSignal?: DiagnosticEvidenceSignal | null;
}

export interface DiagnosticPolicy {
  version: string;
  areaIds: string[];
  minimumEvidencePerArea: number;
  minimumCompetenciesPerArea: number;
  desiredDifficulties: number[];
  minimumTotalEvidence: number;
  maximumQuestions: number;
  maximumDurationMinutes: number;
}

export const DIAGNOSTIC_POLICY_V2: DiagnosticPolicy = {
  version: 'diagnostic-policy-v2-synthetic',
  areaIds: [
    '50000000-0000-4000-8000-000000000001',
    '50000000-0000-4000-8000-000000000002',
    '50000000-0000-4000-8000-000000000003',
    '50000000-0000-4000-8000-000000000004',
    '50000000-0000-4000-8000-000000000005',
  ],
  minimumEvidencePerArea: 1,
  minimumCompetenciesPerArea: 1,
  desiredDifficulties: [2, 3, 4],
  minimumTotalEvidence: 5,
  maximumQuestions: 10,
  maximumDurationMinutes: 30,
};

const normalizedSafety = (value: DeclaredSafety) =>
  value === 'high'
    ? 'certain'
    : value === 'medium' || value === 'low'
      ? 'uncertain'
      : value;

export function combineDiagnosticEvidence(input: {
  isCorrect: boolean;
  statedConfidence: DeclaredSafety;
  difficulty: number;
  responseTimeMs?: number;
  priorCertainErrors?: number;
  algorithmVersion?: string;
  competencyIds?: string[];
  areaIds?: string[];
  targetExamProgramId?: string | null;
}): {
  signal: DiagnosticEvidenceSignal;
  weight: number;
  algorithmVersion: string;
  context: {
    competencyIds: string[];
    areaIds: string[];
    targetExamProgramId: string | null;
  };
} {
  const safety = normalizedSafety(input.statedConfidence);
  const difficultyWeight =
    0.8 + Math.min(5, Math.max(1, input.difficulty)) * 0.04;
  const reliableTime =
    input.responseTimeMs === undefined ||
    (input.responseTimeMs >= 1_000 && input.responseTimeMs <= 900_000);
  let signal: DiagnosticEvidenceSignal = 'insufficient_evidence';
  if (input.isCorrect && safety === 'certain')
    signal = 'evidence_of_consolidation';
  else if (!input.isCorrect && safety === 'do_not_know')
    signal = 'explicit_gap';
  else if (
    input.isCorrect &&
    (safety === 'uncertain' || safety === 'do_not_know')
  )
    signal = 'uncertain_knowledge';
  else if (
    !input.isCorrect &&
    safety === 'certain' &&
    (input.priorCertainErrors ?? 0) >= 1
  )
    signal = 'possible_miscalibration';
  return {
    signal,
    weight:
      Math.round(difficultyWeight * (reliableTime ? 1 : 0.85) * 100_000) /
      100_000,
    algorithmVersion: input.algorithmVersion ?? 'diagnostic-evidence-v2',
    context: {
      competencyIds: [...new Set(input.competencyIds ?? [])].sort(),
      areaIds: [...new Set(input.areaIds ?? [])].sort(),
      targetExamProgramId: input.targetExamProgramId ?? null,
    },
  };
}

export function coverageState(
  observations: DiagnosticObservation[],
  policy: DiagnosticPolicy,
) {
  return policy.areaIds.map((areaId) => {
    const area = observations.filter((item) => item.areaIds.includes(areaId));
    return {
      areaId,
      evidenceCount: area.length,
      competencyCount: new Set(area.flatMap((item) => item.competencyIds)).size,
      difficulties: [...new Set(area.map((item) => item.difficulty))].sort(),
      complete:
        area.length >= policy.minimumEvidencePerArea &&
        new Set(area.flatMap((item) => item.competencyIds)).size >=
          policy.minimumCompetenciesPerArea,
    };
  });
}

export function evaluateDiagnosticStop(input: {
  observations: DiagnosticObservation[];
  policy: DiagnosticPolicy;
  elapsedMinutes?: number;
  contentAvailable?: boolean;
}): {
  shouldStop: boolean;
  evidenceSufficient: boolean;
  reason:
    | 'coverage_complete'
    | 'question_budget_reached'
    | 'duration_reached'
    | 'content_exhausted'
    | null;
} {
  const coverage = coverageState(input.observations, input.policy);
  const sufficient =
    coverage.every((area) => area.complete) &&
    input.observations.length >= input.policy.minimumTotalEvidence;
  if (sufficient)
    return {
      shouldStop: true,
      evidenceSufficient: true,
      reason: 'coverage_complete',
    };
  if (input.observations.length >= input.policy.maximumQuestions)
    return {
      shouldStop: true,
      evidenceSufficient: false,
      reason: 'question_budget_reached',
    };
  if ((input.elapsedMinutes ?? 0) >= input.policy.maximumDurationMinutes)
    return {
      shouldStop: true,
      evidenceSufficient: false,
      reason: 'duration_reached',
    };
  if (input.contentAvailable === false)
    return {
      shouldStop: true,
      evidenceSufficient: false,
      reason: 'content_exhausted',
    };
  return { shouldStop: false, evidenceSufficient: false, reason: null };
}

export function confidenceLevel(
  input: {
    evidenceCount: number;
    lastEvidenceAt: string | null;
    correctness: boolean[];
    distinctQuestionCount: number;
  },
  asOf: Date,
): { value: number; level: 'low' | 'medium' | 'high' } {
  const recency = input.lastEvidenceAt
    ? Math.max(
        0,
        1 - (asOf.getTime() - Date.parse(input.lastEvidenceAt)) / 7_776_000_000,
      )
    : 0;
  const mean = input.correctness.length
    ? input.correctness.filter(Boolean).length / input.correctness.length
    : 0.5;
  const consistency =
    input.correctness.length < 2
      ? 0
      : 1 -
        input.correctness.reduce(
          (sum, value) => sum + Math.abs(Number(value) - mean),
          0,
        ) /
          input.correctness.length;
  const quantity = Math.min(1, input.evidenceCount / 5);
  const diversity = Math.min(1, input.distinctQuestionCount / 3);
  const value =
    Math.round(
      (quantity * 0.4 + recency * 0.2 + consistency * 0.2 + diversity * 0.2) *
        100_000,
    ) / 100_000;
  return {
    value,
    level: value >= 0.7 ? 'high' : value >= 0.4 ? 'medium' : 'low',
  };
}

export function selectNextQuestion(input: {
  candidates: AssessmentCandidate[];
  mastery: MasteryState[];
  attemptedQuestionIds: string[];
  usedThemeIds: string[];
  observations?: DiagnosticObservation[];
  policy?: DiagnosticPolicy;
}): AssessmentSelection | null {
  const attempted = new Set(input.attemptedQuestionIds);
  const usedThemes = new Set(input.usedThemeIds);
  const policy = input.policy ?? DIAGNOSTIC_POLICY_V2;
  const observations = input.observations ?? [];
  const uncovered = new Set(
    coverageState(observations, policy)
      .filter((area) => !area.complete)
      .map((area) => area.areaId),
  );
  const fragileCompetencies = new Set(
    observations
      .filter((item) =>
        [
          'explicit_gap',
          'uncertain_knowledge',
          'possible_miscalibration',
        ].includes(item.evidenceSignal ?? ''),
      )
      .flatMap((item) => item.competencyIds),
  );
  return (
    input.candidates
      .filter((candidate) => !attempted.has(candidate.questionVersionId))
      .map((candidate) => {
        const states = candidate.competencyIds.map((id) =>
          input.mastery.find((state) => state.competencyId === id),
        );
        const confidence =
          states.reduce((sum, state) => sum + (state?.confidence ?? 0), 0) /
          states.length;
        const mastery =
          states.reduce((sum, state) => sum + (state?.mastery ?? 0.5), 0) /
          states.length;
        const targetDifficulty =
          mastery >= 0.75 ? 5 : mastery >= 0.55 ? 4 : mastery >= 0.35 ? 3 : 2;
        const unseen = states.some(
          (state) => !state || state.evidenceCount === 0,
        )
          ? 1
          : 0;
        const themeDiversity = candidate.themeIds.some(
          (id) => !usedThemes.has(id),
        )
          ? 1
          : 0;
        const areaCoverage = candidate.areaIds.some((id) => uncovered.has(id))
          ? 1
          : 0;
        const needsDepth = candidate.competencyIds.some((id) =>
          fragileCompetencies.has(id),
        )
          ? 1
          : 0;
        const difficultyFit =
          1 - Math.abs(candidate.difficulty - targetDifficulty) / 4;
        const difficultyDiversity = observations.some(
          (item) => item.difficulty === candidate.difficulty,
        )
          ? 0
          : 1;
        const examComplement = Math.min(
          1,
          Math.max(0, candidate.examRelevance ?? 0),
        );
        const score =
          areaCoverage * 0.45 +
          needsDepth * 0.2 +
          unseen * 0.1 +
          (1 - confidence) * 0.08 +
          themeDiversity * 0.07 +
          difficultyDiversity * 0.05 +
          difficultyFit * 0.03 +
          examComplement * 0.02;
        return {
          candidate,
          score: Math.round(score * 100_000) / 100_000,
          reason: areaCoverage
            ? 'cobertura mínima de grande área'
            : needsDepth
              ? 'aprofundamento de fragilidade ou incerteza observada'
              : unseen
                ? 'competência ainda não medida'
                : confidence < 0.4
                  ? 'confirmação de baixa confiança'
                  : candidate.difficulty > targetDifficulty
                    ? 'aumento controlado de dificuldade'
                    : 'cobertura equilibrada de competências',
        };
      })
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.candidate.questionVersionId.localeCompare(
            right.candidate.questionVersionId,
          ),
      )[0] ?? null
  );
}

export function diagnosticCoverage(
  targetCompetencyIds: string[],
  measuredCompetencyIds: string[],
) {
  if (targetCompetencyIds.length === 0) return 0;
  const measured = new Set(measuredCompetencyIds);
  return (
    Math.round(
      (targetCompetencyIds.filter((id) => measured.has(id)).length /
        new Set(targetCompetencyIds).size) *
        100_000,
    ) / 100_000
  );
}

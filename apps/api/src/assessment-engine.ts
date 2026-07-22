import type { MasteryState } from '@iatron/contracts';

export interface AssessmentCandidate {
  questionVersionId: string;
  difficulty: number;
  themeIds: string[];
  competencyIds: string[];
}

export interface AssessmentSelection {
  candidate: AssessmentCandidate;
  score: number;
  reason: string;
}

export function confidenceLevel(input: {
  evidenceCount: number;
  lastEvidenceAt: string | null;
  correctness: boolean[];
  distinctQuestionCount: number;
}, asOf: Date): { value: number; level: 'low' | 'medium' | 'high' } {
  const recency = input.lastEvidenceAt
    ? Math.max(0, 1 - (asOf.getTime() - Date.parse(input.lastEvidenceAt)) / 7_776_000_000)
    : 0;
  const mean = input.correctness.length
    ? input.correctness.filter(Boolean).length / input.correctness.length
    : 0.5;
  const consistency = input.correctness.length < 2
    ? 0
    : 1 - input.correctness.reduce((sum, value) => sum + Math.abs(Number(value) - mean), 0) / input.correctness.length;
  const quantity = Math.min(1, input.evidenceCount / 5);
  const diversity = Math.min(1, input.distinctQuestionCount / 3);
  const value = Math.round((quantity * 0.4 + recency * 0.2 + consistency * 0.2 + diversity * 0.2) * 100_000) / 100_000;
  return { value, level: value >= 0.7 ? 'high' : value >= 0.4 ? 'medium' : 'low' };
}

export function selectNextQuestion(input: {
  candidates: AssessmentCandidate[];
  mastery: MasteryState[];
  attemptedQuestionIds: string[];
  usedThemeIds: string[];
}): AssessmentSelection | null {
  const attempted = new Set(input.attemptedQuestionIds);
  const usedThemes = new Set(input.usedThemeIds);
  return input.candidates
    .filter((candidate) => !attempted.has(candidate.questionVersionId))
    .map((candidate) => {
      const states = candidate.competencyIds.map((id) =>
        input.mastery.find((state) => state.competencyId === id),
      );
      const confidence = states.reduce((sum, state) => sum + (state?.confidence ?? 0), 0) / states.length;
      const mastery = states.reduce((sum, state) => sum + (state?.mastery ?? 0.5), 0) / states.length;
      const targetDifficulty = mastery >= 0.75 ? 5 : mastery >= 0.55 ? 4 : mastery >= 0.35 ? 3 : 2;
      const unseen = states.some((state) => !state || state.evidenceCount === 0) ? 1 : 0;
      const themeDiversity = candidate.themeIds.some((id) => !usedThemes.has(id)) ? 1 : 0;
      const difficultyFit = 1 - Math.abs(candidate.difficulty - targetDifficulty) / 4;
      const score = unseen * 0.35 + (1 - confidence) * 0.35 + themeDiversity * 0.2 + difficultyFit * 0.1;
      return {
        candidate,
        score: Math.round(score * 100_000) / 100_000,
        reason: unseen
          ? 'competência ainda não medida'
          : confidence < 0.4
            ? 'confirmação de baixa confiança'
            : candidate.difficulty > targetDifficulty
              ? 'aumento controlado de dificuldade'
              : 'cobertura equilibrada de competências',
      };
    })
    .sort((left, right) => right.score - left.score || left.candidate.questionVersionId.localeCompare(right.candidate.questionVersionId))[0] ?? null;
}

export function diagnosticCoverage(targetCompetencyIds: string[], measuredCompetencyIds: string[]) {
  if (targetCompetencyIds.length === 0) return 0;
  const measured = new Set(measuredCompetencyIds);
  return Math.round((targetCompetencyIds.filter((id) => measured.has(id)).length / new Set(targetCompetencyIds).size) * 100_000) / 100_000;
}

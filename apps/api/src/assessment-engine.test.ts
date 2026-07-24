import { describe, expect, it } from 'vitest';
import {
  DIAGNOSTIC_POLICY_V2,
  combineDiagnosticEvidence,
  confidenceLevel,
  coverageState,
  diagnosticCoverage,
  evaluateDiagnosticStop,
  selectNextQuestion,
} from './assessment-engine.js';

const candidate = (
  id: string,
  competencyId: string,
  difficulty: number,
  theme: string,
  areaId = DIAGNOSTIC_POLICY_V2.areaIds[0]!,
) => ({
  questionVersionId: id,
  competencyIds: [competencyId],
  difficulty,
  themeIds: [theme],
  areaIds: [areaId],
});
const observation = (areaId: string, overrides = {}) => ({
  questionVersionId: `q-${areaId}`,
  areaIds: [areaId],
  competencyIds: [`c-${areaId}`],
  difficulty: 3,
  isCorrect: true,
  statedConfidence: 'certain' as const,
  evidenceSignal: 'evidence_of_consolidation' as const,
  ...overrides,
});
describe('adaptive assessment engine', () => {
  it('prioritizes unmeasured competencies reproducibly', () => {
    const input = {
      candidates: [
        candidate('b', 'known', 3, 'used'),
        candidate('a', 'new', 2, 'new'),
      ],
      mastery: [
        {
          competencyId: 'known',
          competencyCode: 'K',
          competencyName: 'Known',
          mastery: 0.6,
          confidence: 0.8,
          evidenceCount: 5,
          trend: 'stable' as const,
          lastEvidenceAt: '2026-07-20T00:00:00Z',
          algorithmVersion: 'mastery-v1',
        },
      ],
      attemptedQuestionIds: [],
      usedThemeIds: ['used'],
    };
    expect(selectNextQuestion(input)?.candidate.questionVersionId).toBe('a');
    expect(selectNextQuestion(input)).toEqual(selectNextQuestion(input));
  });
  it('never repeats attempted questions', () => {
    expect(
      selectNextQuestion({
        candidates: [candidate('a', 'new', 2, 't')],
        mastery: [],
        attemptedQuestionIds: ['a'],
        usedThemeIds: [],
      }),
    ).toBeNull();
  });
  it('combines quantity, recency, consistency and diversity for confidence', () => {
    expect(
      confidenceLevel(
        {
          evidenceCount: 5,
          lastEvidenceAt: '2026-07-22T00:00:00Z',
          correctness: [true, true, true, true],
          distinctQuestionCount: 3,
        },
        new Date('2026-07-23T00:00:00Z'),
      ).level,
    ).toBe('high');
    expect(
      confidenceLevel(
        {
          evidenceCount: 1,
          lastEvidenceAt: null,
          correctness: [true],
          distinctQuestionCount: 1,
        },
        new Date('2026-07-23T00:00:00Z'),
      ).level,
    ).toBe('low');
  });
  it('calculates competency coverage rather than global score', () => {
    expect(diagnosticCoverage(['a', 'b', 'c'], ['a', 'c'])).toBe(0.66667);
  });
  it.each([
    [true, 'certain', 0, 'evidence_of_consolidation'],
    [false, 'do_not_know', 0, 'explicit_gap'],
    [true, 'uncertain', 0, 'uncertain_knowledge'],
    [false, 'certain', 0, 'insufficient_evidence'],
    [false, 'certain', 1, 'possible_miscalibration'],
    [true, null, 0, 'insufficient_evidence'],
  ] as const)(
    'combines correctness and declared safety deterministically',
    (isCorrect, statedConfidence, priorCertainErrors, signal) => {
      expect(
        combineDiagnosticEvidence({
          isCorrect,
          statedConfidence,
          priorCertainErrors,
          difficulty: 3,
        }).signal,
      ).toBe(signal);
    },
  );
  it('tracks minimum coverage and competency diversity per large area', () => {
    const observations = DIAGNOSTIC_POLICY_V2.areaIds.map((areaId) =>
      observation(areaId),
    );
    expect(
      coverageState(observations, DIAGNOSTIC_POLICY_V2).every(
        (area) => area.complete,
      ),
    ).toBe(true);
  });
  it('prioritizes uncovered area before AMRIGS complementary relevance', () => {
    const coveredArea = DIAGNOSTIC_POLICY_V2.areaIds[0]!;
    const uncoveredArea = DIAGNOSTIC_POLICY_V2.areaIds[1]!;
    const selection = selectNextQuestion({
      candidates: [
        {
          ...candidate('amrigs', 'c1', 3, 't1', coveredArea),
          examRelevance: 1,
        },
        {
          ...candidate('coverage', 'c2', 3, 't2', uncoveredArea),
          examRelevance: 0,
        },
      ],
      mastery: [],
      attemptedQuestionIds: [],
      usedThemeIds: [],
      observations: [observation(coveredArea)],
      policy: {
        ...DIAGNOSTIC_POLICY_V2,
        areaIds: [coveredArea, uncoveredArea],
      },
    });
    expect(selection?.candidate.questionVersionId).toBe('coverage');
  });
  it('deepens repeated uncertainty after minimum coverage', () => {
    const areaId = DIAGNOSTIC_POLICY_V2.areaIds[0]!;
    const selection = selectNextQuestion({
      candidates: [
        candidate('depth', 'fragile', 4, 'new', areaId),
        candidate('other', 'other', 3, 'old', areaId),
      ],
      mastery: [],
      attemptedQuestionIds: [],
      usedThemeIds: ['old'],
      observations: [
        observation(areaId, {
          competencyIds: ['fragile'],
          evidenceSignal: 'explicit_gap',
        }),
      ],
      policy: {
        ...DIAGNOSTIC_POLICY_V2,
        areaIds: [areaId],
        minimumTotalEvidence: 2,
      },
    });
    expect(selection?.candidate.questionVersionId).toBe('depth');
  });
  it('stops normally only after coverage and evidence requirements', () => {
    const observations = DIAGNOSTIC_POLICY_V2.areaIds.map((areaId) =>
      observation(areaId),
    );
    expect(
      evaluateDiagnosticStop({ observations, policy: DIAGNOSTIC_POLICY_V2 }),
    ).toEqual({
      shouldStop: true,
      evidenceSufficient: true,
      reason: 'coverage_complete',
    });
  });
  it('stops at budget with explicit insufficient evidence', () => {
    const observations = Array.from(
      { length: DIAGNOSTIC_POLICY_V2.maximumQuestions },
      (_, index) =>
        observation(DIAGNOSTIC_POLICY_V2.areaIds[0]!, {
          questionVersionId: `q-${index}`,
        }),
    );
    expect(
      evaluateDiagnosticStop({ observations, policy: DIAGNOSTIC_POLICY_V2 }),
    ).toMatchObject({
      shouldStop: true,
      evidenceSufficient: false,
      reason: 'question_budget_reached',
    });
  });
  it('remains deterministic with and without a board profile signal', () => {
    const input = {
      candidates: [candidate('b', 'b', 3, 'b'), candidate('a', 'a', 3, 'a')],
      mastery: [],
      attemptedQuestionIds: [],
      usedThemeIds: [],
    };
    expect(selectNextQuestion(input)).toEqual(selectNextQuestion(input));
    expect(
      selectNextQuestion({
        ...input,
        candidates: input.candidates.map((item) => ({
          ...item,
          examRelevance: 0,
        })),
      })?.candidate.questionVersionId,
    ).toBe(selectNextQuestion(input)?.candidate.questionVersionId);
  });
});

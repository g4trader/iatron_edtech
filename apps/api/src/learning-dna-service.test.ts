import { describe, expect, it } from 'vitest';
import {
  calculateLearningDna,
  formatLearningDnaIndicator,
  LEARNING_DNA_POLICY,
  toLearningDnaContext,
  type LearningDnaObservation,
} from './learning-dna-service.js';

const studentId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherStudentId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const competencyId = '54000000-0000-4000-8000-000000000001';
const areaId = '50000000-0000-4000-8000-000000000001';
const observation = (
  index: number,
  overrides: Partial<LearningDnaObservation> = {},
): LearningDnaObservation => ({
  id: `attempt-${index}`,
  studentId,
  occurredAt: new Date(Date.UTC(2026, 6, 1 + index)).toISOString(),
  competencyId,
  areaId,
  themeId: '52000000-0000-4000-8000-000000000001',
  subthemeId: '53000000-0000-4000-8000-000000000001',
  difficulty: 3,
  isCorrect: true,
  responseTimeMs: 60_000,
  statedConfidence: 'certain',
  origin: 'diagnostic',
  ...overrides,
});
const calculate = (
  observations: LearningDnaObservation[],
  extra: Partial<Parameters<typeof calculateLearningDna>[0]> = {},
) =>
  calculateLearningDna({
    studentId,
    observations,
    calculatedAt: '2026-07-24T12:00:00.000Z',
    ...extra,
  });
const state = (snapshot: ReturnType<typeof calculate>, type: string) =>
  snapshot.indicators.find((item) => item.type === type)?.state;

describe('learning DNA deterministic service', () => {
  it('returns explicit insufficiency for a small sample', () => {
    const snapshot = calculate([observation(0)]);
    expect(snapshot.sufficiency).toBe('insufficient');
    expect(snapshot.indicators.every((item) => !item.sufficient)).toBe(true);
  });

  it('classifies stable and variable consistency using multiple events', () => {
    expect(
      state(
        calculate([0, 1, 2, 3].map((index) => observation(index))),
        'consistency',
      ),
    ).toBe('stable');
    expect(
      state(
        calculate(
          [true, false, true, false].map((isCorrect, index) =>
            observation(index, { isCorrect }),
          ),
        ),
        'consistency',
      ),
    ).toBe('variable');
  });

  it('compares speed only with the own valid baseline', () => {
    const snapshot = calculate([
      observation(0, { responseTimeMs: 100_000 }),
      observation(1, { responseTimeMs: 100_000 }),
      observation(2, { responseTimeMs: 60_000 }),
    ]);
    expect(state(snapshot, 'observed_speed')).toBe('faster_than_own_baseline');
  });

  it('ignores invalid times and reports insufficient evidence', () => {
    const snapshot = calculate([
      observation(0, { responseTimeMs: 0 }),
      observation(1, { responseTimeMs: null }),
      observation(2, { responseTimeMs: 8_000_000 }),
    ]);
    expect(state(snapshot, 'observed_speed')).toBe('insufficient_evidence');
  });

  it('recognizes calibrated safety without using an isolated event', () => {
    const one = calculate([observation(0, { isCorrect: false })]);
    expect(state(one, 'calibrated_safety')).toBe('insufficient_evidence');
    const calibrated = calculate(
      [0, 1, 2, 3].map((index) => observation(index)),
    );
    expect(state(calibrated, 'calibrated_safety')).toBe('well_calibrated');
  });

  it('uses possible language for repeated high-confidence errors', () => {
    const snapshot = calculate([
      observation(0, { isCorrect: false }),
      observation(1, { isCorrect: false }),
      observation(2),
      observation(3),
    ]);
    expect(state(snapshot, 'calibrated_safety')).toBe(
      'possible_overconfidence',
    );
    expect(
      snapshot.indicators.find((item) => item.type === 'calibrated_safety')
        ?.message,
    ).toContain('Precisamos de mais evidências');
  });

  it('detects possible underconfidence across repeated correct answers', () => {
    const snapshot = calculate([
      observation(0, { statedConfidence: 'uncertain' }),
      observation(1, { statedConfidence: 'do_not_know' }),
      observation(2),
      observation(3),
    ]);
    expect(state(snapshot, 'calibrated_safety')).toBe(
      'possible_underconfidence',
    );
  });

  it('distinguishes recurring and isolated errors in the same dimension', () => {
    expect(
      state(
        calculate([
          observation(0, { isCorrect: false }),
          observation(1, { isCorrect: false }),
        ]),
        'recurring_error',
      ),
    ).toBe('recurring_gap');
    expect(
      state(
        calculate([observation(0, { isCorrect: false }), observation(1)]),
        'recurring_error',
      ),
    ).toBe('isolated_error');
  });

  it('requires a temporal comparable pair for retention', () => {
    const retained = calculate([
      observation(0),
      observation(8, { occurredAt: '2026-07-10T00:00:00.000Z' }),
    ]);
    expect(state(retained, 'retention')).toBe('retained');
    expect(
      state(calculate([observation(0), observation(1)]), 'retention'),
    ).toBe('insufficient_evidence');
  });

  it('detects response after a reliable review sequence', () => {
    const snapshot = calculate(
      [
        observation(0, { isCorrect: false }),
        observation(2, { isCorrect: true }),
      ],
      {
        reviews: [
          {
            id: 'review-1',
            studentId,
            competencyId,
            occurredAt: '2026-07-02T12:00:00.000Z',
          },
        ],
      },
    );
    expect(state(snapshot, 'review_response')).toBe('improved_after_review');
  });

  it('is deterministic and versioned for the same input', () => {
    const observations = [0, 1, 2, 3].map((index) => observation(index));
    expect(calculate(observations)).toEqual(calculate(observations));
    expect(calculate(observations).policyVersion).toBe(
      LEARNING_DNA_POLICY.version,
    );
  });

  it('isolates students and scopes by area or competency', () => {
    const snapshot = calculate(
      [
        observation(0),
        observation(1, { studentId: otherStudentId }),
        observation(2, {
          areaId: '50000000-0000-4000-8000-000000000002',
        }),
      ],
      { scope: { type: 'area', id: areaId } },
    );
    expect(snapshot.evidenceCount).toBe(1);
    expect(snapshot.studentId).toBe(studentId);
  });

  it('keeps missing declared safety compatible', () => {
    const snapshot = calculate(
      [0, 1, 2, 3].map((index) =>
        observation(index, { statedConfidence: null }),
      ),
    );
    expect(state(snapshot, 'calibrated_safety')).toBe('insufficient_evidence');
  });

  it('formats human messages and exposes a read-only future adapter', () => {
    expect(
      formatLearningDnaIndicator(
        'calibrated_safety',
        'possible_overconfidence',
      ),
    ).not.toMatch(/Learning DNA|algorithm|overconfidence/);
    const context = toLearningDnaContext(calculate([observation(0)]));
    expect(context).not.toHaveProperty('studentId');
    expect(context.sufficiency).toBe('insufficient');
  });
});

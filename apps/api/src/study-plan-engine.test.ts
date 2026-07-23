import { describe, expect, it } from 'vitest';
import {
  generateSevenDayPlan,
  prioritizeStudyRecommendations,
} from './study-plan-engine.js';

const gap = (id: string, overrides: Record<string, unknown> = {}) => ({
  competencyId: id,
  competencyCode: id,
  competencyName: `Competência ${id}`,
  mastery: 0.3,
  confidence: 0.2,
  evidenceCount: 1,
  trend: 'stable' as const,
  lastEvidenceAt: '2026-07-20T00:00:00Z',
  algorithmVersion: 'mastery-v1',
  reasons: ['low_evidence'],
  priority: 0.7,
  ...overrides,
});
const base = {
  gaps: [gap('A'), gap('B', { evidenceCount: 0, mastery: 0, confidence: 0 })],
  availability: [{ weekday: 4, minutesAvailable: 30 }],
  preferredSessionMinutes: 30,
  targetExam: null,
  history: [],
  asOf: new Date('2026-07-23T12:00:00Z'),
  horizonDays: 7,
};
describe('adaptive study plan engine', () => {
  it('is deterministic and prioritizes unmeasured critical state', () => {
    const first = generateSevenDayPlan(base);
    expect(first).toEqual(generateSevenDayPlan(base));
    expect(first.items[0]?.competencyId).toBe('B');
  });
  it('never exceeds daily or weekly availability', () => {
    const result = generateSevenDayPlan(base);
    expect(
      result.items
        .filter((item) => item.plannedDate)
        .reduce((sum, item) => sum + item.estimatedMinutes, 0),
    ).toBeLessThanOrEqual(result.totalAvailableMinutes);
    expect(result.totalAvailableMinutes).toBe(30);
  });
  it('preserves recommendations that cannot be allocated', () => {
    const result = generateSevenDayPlan({ ...base, availability: [] });
    expect(result.items.every((item) => item.status === 'unallocated')).toBe(
      true,
    );
    expect(result.items[0]?.justification.unallocatedReason).toBe(
      'insufficient_availability',
    );
  });
  it('adds target exam proximity and relevance explanations', () => {
    const [item] = prioritizeStudyRecommendations({
      gaps: [gap('A')],
      targetExam: {
        id: 'exam',
        applicationDate: '2026-08-01',
        relevantCompetencyIds: ['A'],
      },
      history: [],
      asOf: base.asOf,
    });
    expect(item?.reasons.map((reason) => reason.code)).toEqual(
      expect.arrayContaining(['target_exam_relevance', 'exam_proximity']),
    );
  });
  it('raises deferred items without exceeding a bounded contribution', () => {
    const [item] = prioritizeStudyRecommendations({
      gaps: [gap('A')],
      targetExam: null,
      history: [{ competencyId: 'A', deferredCount: 9 }],
      asOf: base.asOf,
    });
    expect(
      item?.reasons.find((reason) => reason.code === 'previously_deferred')
        ?.contribution,
    ).toBe(0.05);
  });
});

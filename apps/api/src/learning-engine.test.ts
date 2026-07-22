import { describe, expect, it } from 'vitest';
import {
  buildDailySchedule,
  buildTimeline,
  calculateMastery,
  deriveEvidence,
  identifyLearningGaps,
} from './learning-engine.js';

const competency = {
  id: '54000000-0000-4000-8000-000000000001',
  code: 'CARD.SCA.001',
  name: 'Reconhecer infarto',
};
const second = {
  id: '54000000-0000-4000-8000-000000000002',
  code: 'CARD.SCA.002',
  name: 'Indicar reperfusão',
};

describe('learning engine', () => {
  it('derives explainable evidence from an event', () => {
    const evidence = deriveEvidence({
      id: '61000000-0000-4000-8000-000000000001',
      studentId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      type: 'QuestionAnswered',
      occurredAt: '2026-07-20T12:00:00.000Z',
      outcomes: [
        {
          competency,
          weight: 1,
          difficulty: 4,
          responseTimeMs: 80_000,
          isCorrect: true,
        },
      ],
    });
    expect(evidence[0]).toMatchObject({
      eventId: '61000000-0000-4000-8000-000000000001',
      competencyCode: 'CARD.SCA.001',
      difficulty: 4,
      isCorrect: true,
      algorithmVersion: 'evidence-v1',
    });
  });

  it('calculates reproducible mastery, confidence and trend', () => {
    const evidence = [false, true, true].flatMap((isCorrect, index) =>
      deriveEvidence({
        id: `61000000-0000-4000-8000-00000000000${index + 1}`,
        studentId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        type: 'QuestionAnswered',
        occurredAt: `2026-07-${18 + index}T12:00:00.000Z`,
        outcomes: [
          {
            competency,
            weight: 1,
            difficulty: 3,
            responseTimeMs: 60_000,
            isCorrect,
          },
        ],
      }),
    );
    const result = calculateMastery([competency], evidence)[0]!;
    expect(result).toMatchObject({
      mastery: 0.66667,
      confidence: 0.6,
      evidenceCount: 3,
      trend: 'improving',
    });
  });

  it('classifies critical, forgotten and low-evidence gaps', () => {
    const gaps = identifyLearningGaps(
      [competency, second],
      [
        {
          competencyId: competency.id,
          competencyCode: competency.code,
          competencyName: competency.name,
          mastery: 0.2,
          confidence: 0.6,
          evidenceCount: 3,
          trend: 'declining',
          lastEvidenceAt: '2026-05-01T12:00:00.000Z',
          algorithmVersion: 'mastery-v1',
        },
      ],
      new Date('2026-07-22T12:00:00.000Z'),
    );
    expect(
      gaps.find((gap) => gap.competencyId === competency.id)?.reasons,
    ).toEqual(expect.arrayContaining(['critical', 'forgotten']));
    expect(
      gaps.find((gap) => gap.competencyId === second.id)?.reasons,
    ).toContain('low_evidence');
  });

  it('orders the daily schedule deterministically', () => {
    const gaps = identifyLearningGaps(
      [second, competency],
      [],
      new Date('2026-07-22T12:00:00.000Z'),
    );
    const schedule = buildDailySchedule(gaps);
    expect(schedule.map((item) => item.competencyCode)).toEqual([
      'CARD.SCA.001',
      'CARD.SCA.002',
    ]);
    expect(schedule[0]).toMatchObject({ rank: 1, recommendedMinutes: 45 });
  });

  it('reconstructs timeline newest first without mutating input', () => {
    const input = [
      {
        id: '61000000-0000-4000-8000-000000000001',
        occurredAt: '2026-07-20T12:00:00.000Z',
        type: 'event',
        title: 'Antigo',
        detail: 'A',
        competencyId: null,
      },
      {
        id: '61000000-0000-4000-8000-000000000002',
        occurredAt: '2026-07-21T12:00:00.000Z',
        type: 'mastery',
        title: 'Novo',
        detail: 'B',
        competencyId: competency.id,
      },
    ];
    expect(buildTimeline(input).map((item) => item.title)).toEqual([
      'Novo',
      'Antigo',
    ]);
    expect(input[0]!.title).toBe('Antigo');
  });
});

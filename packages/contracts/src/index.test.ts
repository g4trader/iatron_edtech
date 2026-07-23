import { describe, expect, it } from 'vitest';
import {
  availabilityInputSchema,
  competencyCatalogSchema,
  guidelineCatalogSchema,
  learningEvidenceSchema,
  masteryStateSchema,
  onboardingInputSchema,
  profileUpdateSchema,
  serviceStatusSchema,
  studyPlanSchema,
  targetExamsInputSchema,
} from './index.js';

describe('serviceStatusSchema', () => {
  it('accepts a health response', () => {
    expect(
      serviceStatusSchema.parse({
        status: 'ok',
        service: 'api',
        timestamp: new Date().toISOString(),
      }).status,
    ).toBe('ok');
  });
});

describe('academic read contracts', () => {
  it('serializes a competency only at the measurable leaf level', () => {
    expect(
      competencyCatalogSchema.parse({
        id: '54000000-0000-4000-8000-000000000001',
        code: 'CARD.SCA.001',
        name: 'Reconhecer infarto',
        description: 'Reconhecer critérios diagnósticos.',
        subtheme: {
          id: '53000000-0000-4000-8000-000000000001',
          code: 'IAM_COM_SUPRA',
          name: 'Infarto com supra',
          theme: {
            id: '52000000-0000-4000-8000-000000000001',
            code: 'SINDROMES_CORONARIANAS',
            name: 'Síndromes coronarianas',
            area: {
              id: '51000000-0000-4000-8000-000000000001',
              code: 'CARDIOLOGIA',
              name: 'Cardiologia',
            },
          },
        },
        objectives: [{ position: 1, description: 'Interpretar o ECG.' }],
      }).code,
    ).toBe('CARD.SCA.001');
  });

  it('requires guideline version and issuer', () => {
    expect(() =>
      guidelineCatalogSchema.parse({
        id: crypto.randomUUID(),
        stableKey: 'guideline',
        title: 'Guideline sem versão',
      }),
    ).toThrow();
  });
});

describe('learning engine contracts', () => {
  it('serializes explainable evidence and normalized mastery', () => {
    const evidence = learningEvidenceSchema.parse({
      id: crypto.randomUUID(),
      eventId: crypto.randomUUID(),
      competencyId: crypto.randomUUID(),
      competencyCode: 'CARD.SCA.001',
      competencyName: 'Reconhecer infarto',
      sourceEventId: crypto.randomUUID(),
      weight: 1,
      difficulty: 3,
      responseTimeMs: 42000,
      isCorrect: true,
      observedAt: '2026-07-22T21:38:03.034+00:00',
      algorithmVersion: 'evidence-v1',
    });
    const mastery = masteryStateSchema.parse({
      competencyId: evidence.competencyId,
      competencyCode: 'CARD.SCA.001',
      competencyName: 'Reconhecer infarto',
      mastery: 0.8,
      confidence: 0.6,
      evidenceCount: 3,
      trend: 'improving',
      lastEvidenceAt: evidence.observedAt,
      algorithmVersion: 'mastery-v1',
    });

    expect(mastery.mastery).toBe(0.8);
    expect(evidence.eventId).toBeTruthy();
  });

  it('rejects invalid mastery and evidence measurements', () => {
    expect(() =>
      masteryStateSchema.parse({
        competencyId: crypto.randomUUID(),
        competencyCode: 'CARD.SCA.001',
        competencyName: 'Reconhecer infarto',
        mastery: 1.1,
        confidence: 0.6,
        evidenceCount: 3,
        trend: 'stable',
        lastEvidenceAt: new Date().toISOString(),
        algorithmVersion: 'mastery-v1',
      }),
    ).toThrow();
    expect(() =>
      learningEvidenceSchema.parse({
        id: crypto.randomUUID(),
        eventId: crypto.randomUUID(),
        competencyId: crypto.randomUUID(),
        competencyCode: 'CARD.SCA.001',
        competencyName: 'Reconhecer infarto',
        weight: 0,
        difficulty: 3,
        responseTimeMs: null,
        isCorrect: false,
        observedAt: new Date().toISOString(),
        algorithmVersion: 'evidence-v1',
      }),
    ).toThrow();
  });
});

describe('adaptive study plan contracts', () => {
  it('serializes an explainable allocated recommendation', () => {
    const id = crypto.randomUUID();
    const plan = studyPlanSchema.parse({
      planId: id,
      versionId: crypto.randomUUID(),
      version: 1,
      objective: 'Plano adaptativo de 7 dias',
      algorithmVersion: 'adaptive-study-plan-v1',
      periodStart: '2026-07-23',
      periodEnd: '2026-07-29',
      generatedAt: '2026-07-23T12:00:00+00:00',
      totalPlannedMinutes: 30,
      totalAvailableMinutes: 60,
      triggerReason: 'manual',
      items: [
        {
          id: crypto.randomUUID(),
          competencyId: crypto.randomUUID(),
          competencyCode: 'CARD.SCA.001',
          competencyName: 'Reconhecer infarto',
          itemType: 'gap_reinforcement',
          priority: 0.9,
          estimatedMinutes: 30,
          plannedDate: '2026-07-23',
          position: 1,
          status: 'planned',
          origin: 'learning-gap-engine',
          reasons: [
            {
              code: 'critical',
              contribution: 0.45,
              detail: 'Gap crítico priorizado.',
            },
          ],
          replanCount: 0,
        },
      ],
    });

    expect(plan.planId).toBe(id);
    expect(plan.items[0]?.reasons[0]?.code).toBe('critical');
  });
});

describe('public write contracts', () => {
  it('rejects mass assignment and unknown properties', () => {
    expect(() =>
      profileUpdateSchema.parse({
        displayName: 'Ana',
        user_id: crypto.randomUUID(),
      }),
    ).toThrow();
    expect(() =>
      onboardingInputSchema.parse({ step: 1, complete: false, role: 'admin' }),
    ).toThrow();
  });

  it('enforces UUIDs, limits and unique weekdays', () => {
    expect(() =>
      targetExamsInputSchema.parse({ examEditionIds: ['not-a-uuid'] }),
    ).toThrow();
    expect(() =>
      availabilityInputSchema.parse({
        items: [
          { weekday: 1, minutesAvailable: 60 },
          { weekday: 1, minutesAvailable: 30 },
        ],
      }),
    ).toThrow();
    expect(() =>
      availabilityInputSchema.parse({
        items: [{ weekday: 1, minutesAvailable: 1441 }],
      }),
    ).toThrow();
  });

  it('rejects excessive target exam payloads', () => {
    expect(() =>
      targetExamsInputSchema.parse({
        examEditionIds: Array.from({ length: 21 }, () => crypto.randomUUID()),
      }),
    ).toThrow();
  });
});

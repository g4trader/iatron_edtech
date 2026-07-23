import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';
import type { LearningRepository } from './learning-repository.js';
import type { StudentRepository } from './student-repository.js';
import type { StudyPlanRepository } from './study-plan-repository.js';

const competency = {
  id: '54000000-0000-4000-8000-000000000001',
  code: 'CARD.001',
  name: 'Reconhecer síndrome coronariana',
};
const item = {
  id: '91000000-0000-4000-8000-000000000001',
  competencyId: competency.id,
  competencyCode: competency.code,
  competencyName: competency.name,
  itemType: 'gap_reinforcement' as const,
  priority: 0.9,
  estimatedMinutes: 30,
  plannedDate: '2026-07-23',
  position: 1,
  status: 'planned' as const,
  origin: 'learning-gap-engine',
  reasons: [
    { code: 'low_mastery', contribution: 0.2, detail: 'Mastery baixo.' },
  ],
  replanCount: 0,
};
const plan = {
  planId: '90000000-0000-4000-8000-000000000001',
  versionId: '90000000-0000-4000-8000-000000000002',
  version: 1,
  objective: 'Plano adaptativo de 7 dias',
  algorithmVersion: 'study-plan-v1',
  periodStart: '2026-07-23',
  periodEnd: '2026-07-29',
  generatedAt: '2026-07-23T12:00:00Z',
  totalPlannedMinutes: 30,
  totalAvailableMinutes: 60,
  triggerReason: 'manual',
  items: [item],
};
const plans: StudyPlanRepository = {
  context: async () => ({
    availability: [{ weekday: 4, minutesAvailable: 60 }],
    preferredSessionMinutes: 30,
    targetExam: null,
    history: [],
    executionRevision: '',
  }),
  persist: async () => plan.versionId,
  current: async () => plan,
  history: async () => [plan],
  item: async () => item,
  action: async () => '92000000-0000-4000-8000-000000000001',
};
const learning: LearningRepository = {
  listCompetencies: async () => [competency],
  listCurrentMastery: async () => [
    {
      competencyId: competency.id,
      competencyCode: competency.code,
      competencyName: competency.name,
      mastery: 0.2,
      confidence: 0.4,
      evidenceCount: 2,
      trend: 'declining',
      lastEvidenceAt: '2026-07-01T00:00:00Z',
      algorithmVersion: 'mastery-v1',
    },
  ],
  listEvidence: async () => [],
  listTimeline: async () => [],
};
let app: FastifyInstance | undefined;
afterEach(async () => {
  await app?.close();
  app = undefined;
});
const build = () =>
  buildApp({
    environment: readEnvironment({ NODE_ENV: 'test', ENABLE_API_DOCS: '1' }),
    logger: false,
    tokenVerifier: async () => ({ sub: 'student' }),
    repositoryFactory: () => ({}) as StudentRepository,
    learningRepositoryFactory: () => learning,
    studyPlanRepositoryFactory: () => plans,
    studyPlanClock: () => new Date('2026-07-23T12:00:00Z'),
  });
const auth = { authorization: 'Bearer test-token' };

describe('adaptive study plan API', () => {
  it('requires authentication', async () => {
    app = await build();
    expect(
      (await app.inject({ method: 'POST', url: '/v1/plans/generate' }))
        .statusCode,
    ).toBe(401);
  });
  it('generates a deterministic explainable plan', async () => {
    app = await build();
    const response = await app.inject({
      method: 'POST',
      url: '/v1/plans/generate',
      headers: auth,
      payload: { horizonDays: 7, triggerReason: 'manual' },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      algorithmVersion: 'study-plan-v1',
      items: [{ competencyId: competency.id }],
    });
  });
  it.each([
    ['current', 'planId'],
    ['today', 'items'],
    ['week', 'items'],
    ['history', '0.versionId'],
    ['unallocated', 'items'],
  ])('serves %s plan view', async (path, property) => {
    app = await build();
    const response = await app.inject({
      method: 'GET',
      url: `/v1/plans/${path}`,
      headers: auth,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty(property);
  });
  it.each(['start', 'complete', 'defer', 'skip'])(
    'records %s and replans when required',
    async (action) => {
      app = await build();
      const response = await app.inject({
        method: 'POST',
        url: `/v1/plans/items/${item.id}/${action}`,
        headers: auth,
        payload:
          action === 'complete'
            ? { actualMinutes: 28 }
            : action === 'defer' || action === 'skip'
              ? { reason: 'Motivo informado pelo estudante' }
              : {},
      });
      expect(response.statusCode).toBe(201);
      expect(response.json()).toHaveProperty('actionId');
      if (action !== 'start') expect(response.json()).toHaveProperty('plan');
    },
  );
  it('exposes item and structured justifications', async () => {
    app = await build();
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/v1/plans/items/${item.id}`,
          headers: auth,
        })
      ).json(),
    ).toHaveProperty('reasons');
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/v1/plans/items/${item.id}/justifications`,
          headers: auth,
        })
      ).json()[0],
    ).toHaveProperty('code');
  });
});

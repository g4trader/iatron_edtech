import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';
import type { LearningDnaRepository } from './learning-dna-repository.js';
import { calculateLearningDna } from './learning-dna-service.js';
import type { StudentRepository } from './student-repository.js';

const studentId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const otherStudentId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const competencyId = '54000000-0000-4000-8000-000000000001';
const areaId = '50000000-0000-4000-8000-000000000001';
const observations = [
  {
    id: 'attempt-1',
    studentId,
    occurredAt: '2026-07-01T12:00:00.000Z',
    competencyId,
    areaId,
    themeId: null,
    subthemeId: null,
    difficulty: 3,
    isCorrect: true,
    responseTimeMs: 60_000,
    statedConfidence: 'certain',
    origin: 'diagnostic',
  },
  {
    id: 'attempt-other',
    studentId: otherStudentId,
    occurredAt: '2026-07-02T12:00:00.000Z',
    competencyId,
    areaId,
    themeId: null,
    subthemeId: null,
    difficulty: 3,
    isCorrect: false,
    responseTimeMs: 60_000,
    statedConfidence: 'certain',
    origin: 'diagnostic',
  },
];
const historical = {
  ...calculateLearningDna({
    studentId,
    observations,
    calculatedAt: '2026-07-24T12:00:00.000Z',
  }),
  id: '79000000-0000-4000-8000-000000000001',
};
const repository: LearningDnaRepository = {
  listObservations: async () => observations,
  listReviews: async () => [],
  listSnapshots: async () => [historical],
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
    tokenVerifier: async () => ({ sub: studentId }),
    repositoryFactory: () => ({}) as StudentRepository,
    learningDnaRepositoryFactory: () => repository,
    learningDnaClock: () => new Date('2026-07-24T12:00:00.000Z'),
  });
const auth = { authorization: 'Bearer token' };

describe('learning DNA read API', () => {
  it('requires authentication', async () => {
    app = await build();
    expect(
      (await app.inject({ method: 'GET', url: '/v1/learning/dna/current' }))
        .statusCode,
    ).toBe(401);
  });

  it('calculates the own current snapshot without cross-student evidence', async () => {
    app = await build();
    const response = await app.inject({
      method: 'GET',
      url: '/v1/learning/dna/current',
      headers: auth,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      studentId,
      evidenceCount: 1,
      policyVersion: 'learning-dna-policy-v1-synthetic',
    });
  });

  it.each([
    [`/v1/learning/dna/areas/${areaId}`, 'area'],
    [`/v1/learning/dna/competencies/${competencyId}`, 'competency'],
  ])('supports scoped read at %s', async (url, scopeType) => {
    app = await build();
    const response = await app.inject({ method: 'GET', url, headers: auth });
    expect(response.statusCode).toBe(200);
    expect(response.json().scopeType).toBe(scopeType);
  });

  it('lists immutable historical snapshots with pagination', async () => {
    app = await build();
    const response = await app.inject({
      method: 'GET',
      url: '/v1/learning/dna/snapshots?limit=10&offset=0',
      headers: auth,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()[0].id).toBe(historical.id);
  });

  it('validates identifiers, windows and policy versions', async () => {
    app = await build();
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/v1/learning/dna/areas/not-a-uuid',
          headers: auth,
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/v1/learning/dna/current?policyVersion=unknown',
          headers: auth,
        })
      ).statusCode,
    ).toBe(400);
  });

  it('publishes only authenticated read routes in OpenAPI', async () => {
    app = await build();
    const document = (
      await app.inject({ method: 'GET', url: '/docs/json' })
    ).json();
    expect(document.paths).toHaveProperty('/learning/dna/current');
    expect(document.paths).toHaveProperty('/learning/dna/snapshots');
  });
});

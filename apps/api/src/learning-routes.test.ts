import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';
import type { LearningRepository } from './learning-repository.js';
import type { StudentRepository } from './student-repository.js';

const environment = readEnvironment({ NODE_ENV: 'test', ENABLE_API_DOCS: '1' });
const competency = {
  id: '54000000-0000-4000-8000-000000000001',
  code: 'CARD.SCA.001',
  name: 'Reconhecer infarto',
};
const mastery = {
  competencyId: competency.id,
  competencyCode: competency.code,
  competencyName: competency.name,
  mastery: 0.25,
  confidence: 0.6,
  evidenceCount: 3,
  trend: 'declining' as const,
  lastEvidenceAt: '2026-05-01T12:00:00.000Z',
  algorithmVersion: 'mastery-v1',
};
const repository: LearningRepository = {
  listCompetencies: async () => [competency],
  listEvidence: async () => [
    {
      id: '62000000-0000-4000-8000-000000000001',
      eventId: '61000000-0000-4000-8000-000000000001',
      competencyId: competency.id,
      competencyCode: competency.code,
      competencyName: competency.name,
      weight: 1,
      difficulty: 3,
      responseTimeMs: 80_000,
      isCorrect: false,
      observedAt: '2026-05-01T12:00:00.000Z',
      algorithmVersion: 'evidence-v1',
    },
  ],
  listCurrentMastery: async () => [mastery],
  listTimeline: async () => [
    {
      id: '61000000-0000-4000-8000-000000000001',
      occurredAt: '2026-05-01T12:00:00.000Z',
      type: 'event',
      title: 'QuestionAnswered',
      detail: 'Evento de aprendizagem registrado',
      competencyId: null,
    },
  ],
};
let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

async function build() {
  return buildApp({
    environment,
    logger: false,
    tokenVerifier: async () => ({ sub: 'user-a' }),
    repositoryFactory: () => ({}) as StudentRepository,
    learningRepositoryFactory: () => repository,
    learningClock: () => new Date('2026-07-22T12:00:00.000Z'),
  });
}

describe('learning read API', () => {
  it('protects learning state with authentication', async () => {
    app = await build();
    expect(
      (await app.inject({ method: 'GET', url: '/v1/learning/mastery' }))
        .statusCode,
    ).toBe(401);
  });

  it.each([
    ['mastery', 'mastery'],
    ['evidence', 'algorithmVersion'],
    ['gaps', 'reasons'],
    ['timeline', 'occurredAt'],
    ['schedule', 'rank'],
  ])('serves deterministic %s data', async (path, property) => {
    app = await build();
    const response = await app.inject({
      method: 'GET',
      url: `/v1/learning/${path}`,
      headers: { authorization: 'Bearer valid-test-token' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()[0]).toHaveProperty(property);
  });

  it('exposes learning endpoints in OpenAPI', async () => {
    app = await build();
    const response = await app.inject({ method: 'GET', url: '/docs/json' });
    const paths = Object.keys(
      (response.json() as { paths: Record<string, unknown> }).paths,
    );
    expect(paths).toEqual(
      expect.arrayContaining([
        '/learning/mastery',
        '/learning/evidence',
        '/learning/gaps',
        '/learning/timeline',
        '/learning/schedule',
      ]),
    );
  });
});

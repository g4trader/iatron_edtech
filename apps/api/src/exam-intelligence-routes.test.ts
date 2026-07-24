import type {
  ExamBlueprint,
  ExamIntelligenceProfile,
  ExamRecurrenceStatistic,
} from '@iatron/contracts';
import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';
import type { ExamIntelligenceRepository } from './exam-intelligence-repository.js';
import type { StudentRepository } from './student-repository.js';

const environment = readEnvironment({ NODE_ENV: 'test', ENABLE_API_DOCS: '1' });
const profile: ExamIntelligenceProfile = {
  id: '65000000-0000-4000-8000-000000000001',
  displayName: 'Perfil demonstrativo AMRIGS',
  version: 1,
  validFrom: '2026-01-01',
  validUntil: null,
  editorialStatus: 'draft',
  isActive: true,
  analysisPeriod: { start: null, end: null },
  examsAnalyzed: 0,
  questionsAnalyzed: 0,
  coverage: 0,
  confidence: 'insufficient',
  limitations: ['Nenhuma prova licenciada foi analisada.'],
  source: {
    title: 'Fixture sintética',
    url: null,
    origin: 'synthetic_fixture',
  },
  responsibleEditorial: 'Equipe editorial de desenvolvimento',
  responsibleStatistical: null,
  notes: null,
  methodVersion: 'exam-intelligence-mvp-v1',
  isSynthetic: true,
  lastUpdatedAt: '2026-07-24T12:00:00Z',
  program: {
    id: '63000000-0000-4000-8000-000000000001',
    code: 'AMRIGS',
    name: 'Prova AMB/AMRIGS',
    board: {
      id: '62000000-0000-4000-8000-000000000001',
      name: 'Associação Médica do Rio Grande do Sul',
      acronym: 'AMB/AMRIGS',
    },
    institution: {
      id: '61000000-0000-4000-8000-000000000001',
      name: 'Associação Médica do Rio Grande do Sul',
      acronym: 'AMRIGS',
    },
  },
};
const blueprint: ExamBlueprint = {
  id: '66000000-0000-4000-8000-000000000001',
  profileId: profile.id,
  version: 1,
  isActive: true,
  expectedQuestionCount: 100,
  durationMinutes: 240,
  formatDescription: 'Distribuição demonstrativa.',
  correctionRules: 'Sem regra oficial.',
  notes: 'Valores sintéticos.',
  source: { title: 'Fixture sintética', url: null },
  period: { start: null, end: null },
  confidence: 'insufficient',
  editorialStatus: 'draft',
  isSynthetic: true,
  areas: [
    {
      id: '50000000-0000-4000-8000-000000000001',
      code: 'CLINICA_MEDICA',
      name: 'Clínica Médica',
      expectedProportion: 0.2,
      expectedQuestionCount: 20,
      weight: 1,
      notes: 'Valor exclusivamente sintético.',
      position: 1,
    },
  ],
};
const repository: ExamIntelligenceRepository = {
  listProfiles: async () => [profile],
  getProfile: async (id) => (id === profile.id ? profile : null),
  getBlueprint: async (id) => (id === profile.id ? blueprint : null),
  listStatistics: async () => [] as ExamRecurrenceStatistic[],
  getTargetExam: async () => ({
    editionId: '64000000-0000-4000-8000-000000000001',
    programId: profile.program.id,
  }),
};
let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

const build = async (source = repository) =>
  buildApp({
    environment,
    logger: false,
    tokenVerifier: async () => ({ sub: 'user-a' }),
    repositoryFactory: () => ({}) as StudentRepository,
    examIntelligenceRepositoryFactory: () => source,
    examIntelligenceClock: () => new Date('2026-07-24T12:00:00Z'),
  });

describe('exam intelligence authenticated API', () => {
  it('requires authentication', async () => {
    app = await build();
    const response = await app.inject({
      method: 'GET',
      url: '/v1/exam-intelligence/context',
    });
    expect(response.statusCode).toBe(401);
  });

  it('lists versions and exposes the synthetic blueprint', async () => {
    app = await build();
    const headers = { authorization: 'Bearer valid-test-token' };
    const profiles = await app.inject({
      method: 'GET',
      url: '/v1/exam-intelligence/profiles',
      headers,
    });
    const response = await app.inject({
      method: 'GET',
      url: `/v1/exam-intelligence/profiles/${profile.id}/blueprint`,
      headers,
    });
    expect(profiles.statusCode).toBe(200);
    expect(profiles.json()[0]).toEqual(
      expect.objectContaining({
        isSynthetic: true,
        confidence: 'insufficient',
      }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        isSynthetic: true,
        areas: [expect.objectContaining({ name: 'Clínica Médica' })],
      }),
    );
  });

  it('resolves the onboarding target without changing plan or diagnosis', async () => {
    app = await build();
    const response = await app.inject({
      method: 'GET',
      url: '/v1/exam-intelligence/context',
      headers: { authorization: 'Bearer valid-test-token' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.objectContaining({
        availability: 'available',
        profile: expect.objectContaining({ version: 1 }),
        explanations: [
          expect.objectContaining({
            relevance: 'insufficient',
            isSynthetic: true,
          }),
        ],
      }),
    );
  });

  it('reports an incompatible target explicitly', async () => {
    app = await build({
      ...repository,
      getTargetExam: async () => ({
        editionId: crypto.randomUUID(),
        programId: crypto.randomUUID(),
      }),
    });
    const response = await app.inject({
      method: 'GET',
      url: '/v1/exam-intelligence/context',
      headers: { authorization: 'Bearer valid-test-token' },
    });
    expect(response.json()).toEqual(
      expect.objectContaining({
        availability: 'unavailable',
        reason: 'unsupported_exam',
      }),
    );
  });

  it('validates relevance dimensions and missing profiles', async () => {
    app = await build();
    const headers = { authorization: 'Bearer valid-test-token' };
    const invalid = await app.inject({
      method: 'GET',
      url: `/v1/exam-intelligence/profiles/${profile.id}/relevance?dimensionType=area`,
      headers,
    });
    const missing = await app.inject({
      method: 'GET',
      url: `/v1/exam-intelligence/profiles/${crypto.randomUUID()}`,
      headers,
    });
    expect(invalid.statusCode).toBe(400);
    expect(missing.statusCode).toBe(404);
  });

  it('documents every read capability in OpenAPI', async () => {
    app = await build();
    const response = await app.inject({ method: 'GET', url: '/docs/json' });
    const paths = (response.json() as { paths: Record<string, unknown> }).paths;
    expect(Object.keys(paths)).toEqual(
      expect.arrayContaining([
        '/exam-intelligence/profiles',
        '/exam-intelligence/profiles/{profileId}',
        '/exam-intelligence/profiles/{profileId}/blueprint',
        '/exam-intelligence/profiles/{profileId}/relevance',
        '/exam-intelligence/context',
      ]),
    );
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';
import type { AcademicRepository } from './academic-repository.js';
import type { StudentRepository } from './student-repository.js';

const environment = readEnvironment({ NODE_ENV: 'test', ENABLE_API_DOCS: '1' });
const emptyStudentRepository = {} as StudentRepository;
const academicRepository: AcademicRepository = {
  listSpecialties: async () => [
    {
      id: '50000000-0000-4000-8000-000000000001',
      code: 'CLINICA_MEDICA',
      name: 'Clínica Médica',
      description: null,
      areas: [],
      programs: [],
    },
  ],
  listAreas: async () => [],
  listThemes: async () => [],
  listCompetencies: async () => [],
  listBoards: async () => [],
  listExams: async () => [],
  listQuestions: async () => [],
  listContentMetadata: async () => [],
  listGuidelines: async () => [],
};
let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

const build = async () =>
  buildApp({
    environment,
    logger: false,
    tokenVerifier: async () => ({ sub: 'user-a' }),
    repositoryFactory: () => emptyStudentRepository,
    academicRepositoryFactory: () => academicRepository,
  });

describe('academic read API', () => {
  it('requires a real authenticated context', async () => {
    app = await build();
    const response = await app.inject({
      method: 'GET',
      url: '/v1/academic/areas',
    });
    expect(response.statusCode).toBe(401);
  });

  it('serializes the academic catalogue', async () => {
    app = await build();
    const response = await app.inject({
      method: 'GET',
      url: '/v1/academic/specialties?limit=10&offset=0',
      headers: { authorization: 'Bearer valid-test-token' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([
      expect.objectContaining({
        code: 'CLINICA_MEDICA',
        name: 'Clínica Médica',
      }),
    ]);
  });

  it('validates pagination before querying', async () => {
    app = await build();
    const response = await app.inject({
      method: 'GET',
      url: '/v1/academic/competencies?limit=1000',
      headers: { authorization: 'Bearer valid-test-token' },
    });
    expect(response.statusCode).toBe(400);
  });

  it('publishes all academic routes in OpenAPI', async () => {
    app = await build();
    const response = await app.inject({ method: 'GET', url: '/docs/json' });
    const paths = (response.json() as { paths: Record<string, unknown> }).paths;
    expect(Object.keys(paths)).toEqual(
      expect.arrayContaining([
        '/academic/specialties',
        '/academic/areas',
        '/academic/themes',
        '/academic/competencies',
        '/academic/boards',
        '/academic/exams',
        '/academic/questions',
        '/academic/content-metadata',
        '/academic/guidelines',
      ]),
    );
  });

  it('exposes only repository-approved question data', async () => {
    app = await buildApp({
      environment,
      logger: false,
      tokenVerifier: async () => ({ sub: 'user-a' }),
      repositoryFactory: () => emptyStudentRepository,
      academicRepositoryFactory: () => ({
        ...academicRepository,
        listQuestions: async () => [
          {
            id: '55000000-0000-4000-8000-000000000001',
            versionId: '55000000-0000-4000-8000-000000000002',
            sourceKey: 'AMRIGS:LICENSED:1',
            stem: 'Enunciado autorizado',
            commentary: null,
            difficulty: 2,
            editorialStatus: 'published',
            exam: {
              id: '64000000-0000-4000-8000-000000000001',
              year: 2026,
              edition: 'Ingresso 2026',
              position: 1,
              board: {
                id: '62000000-0000-4000-8000-000000000001',
                name: 'Associação Médica do Rio Grande do Sul',
                acronym: 'AMB/AMRIGS',
              },
            },
            area: {
              id: '51000000-0000-4000-8000-000000000001',
              code: 'CARDIOLOGIA',
              name: 'Cardiologia',
            },
            competencies: [],
            provenance: {
              origin: 'Fonte autorizada',
              sourceTitle: 'Prova',
              sourceUrl: null,
              rightsHolder: 'Titular',
              legalBasis: 'Licença',
              externalIdentifier: '1',
              authorshipKind: 'medical_team_homologated',
              responsibleParty: 'Editorial',
              obtainedOn: '2026-07-24',
            },
          },
        ],
      }),
    });
    const response = await app.inject({
      method: 'GET',
      url: '/v1/academic/questions',
      headers: { authorization: 'Bearer valid-test-token' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()[0]).toEqual(
      expect.objectContaining({
        editorialStatus: 'published',
        provenance: expect.objectContaining({ legalBasis: 'Licença' }),
      }),
    );
  });
});

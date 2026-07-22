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
        '/academic/guidelines',
      ]),
    );
  });
});

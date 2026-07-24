import { catalogQuerySchema } from '@iatron/contracts';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AcademicRepository } from './academic-repository.js';

export async function registerAcademicRoutes(
  app: FastifyInstance,
  repositoryFactory: (token: string) => AcademicRepository,
) {
  const repository = (request: FastifyRequest) =>
    repositoryFactory(request.auth.accessToken);
  const query = (request: FastifyRequest) =>
    catalogQuerySchema.parse(request.query);
  const routes = [
    [
      'specialties',
      (repository: AcademicRepository, input: ReturnType<typeof query>) =>
        repository.listSpecialties(input),
    ],
    [
      'areas',
      (repository: AcademicRepository, input: ReturnType<typeof query>) =>
        repository.listAreas(input),
    ],
    [
      'themes',
      (repository: AcademicRepository, input: ReturnType<typeof query>) =>
        repository.listThemes(input),
    ],
    [
      'competencies',
      (repository: AcademicRepository, input: ReturnType<typeof query>) =>
        repository.listCompetencies(input),
    ],
    [
      'boards',
      (repository: AcademicRepository, input: ReturnType<typeof query>) =>
        repository.listBoards(input),
    ],
    [
      'exams',
      (repository: AcademicRepository, input: ReturnType<typeof query>) =>
        repository.listExams(input),
    ],
    [
      'questions',
      (repository: AcademicRepository, input: ReturnType<typeof query>) =>
        repository.listQuestions(input),
    ],
    [
      'content-metadata',
      (repository: AcademicRepository, input: ReturnType<typeof query>) =>
        repository.listContentMetadata(input),
    ],
    [
      'guidelines',
      (repository: AcademicRepository, input: ReturnType<typeof query>) =>
        repository.listGuidelines(input),
    ],
  ] as const;
  for (const [path, handler] of routes) {
    app.get(
      `/academic/${path}`,
      {
        schema: {
          tags: ['academic'],
          querystring: {
            type: 'object',
            properties: {
              limit: { type: 'integer', minimum: 1, maximum: 100 },
              offset: { type: 'integer', minimum: 0 },
              search: { type: 'string', maxLength: 100 },
            },
          },
        },
      },
      async (request) => handler(repository(request), query(request)),
    );
  }
}

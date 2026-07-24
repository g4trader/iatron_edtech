import {
  catalogQuerySchema,
  learningDnaQuerySchema,
  uuidSchema,
} from '@iatron/contracts';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { LearningDnaRepository } from './learning-dna-repository.js';
import {
  calculateLearningDna,
  LEARNING_DNA_POLICY,
  type LearningDnaScope,
} from './learning-dna-service.js';

export async function registerLearningDnaRoutes(
  app: FastifyInstance,
  repositoryFactory: (token: string) => LearningDnaRepository,
  clock: () => Date = () => new Date(),
) {
  const source = (request: FastifyRequest) =>
    repositoryFactory(request.auth.accessToken);
  const calculate = async (
    request: FastifyRequest,
    scope: LearningDnaScope,
  ) => {
    const query = learningDnaQuerySchema.parse(request.query);
    const repository = source(request);
    const [observations, reviews] = await Promise.all([
      repository.listObservations(),
      repository.listReviews(),
    ]);
    return calculateLearningDna({
      studentId: request.auth.userId,
      observations,
      reviews,
      scope,
      windowStart: query.windowStart,
      windowEnd: query.windowEnd,
      policy: LEARNING_DNA_POLICY,
      calculatedAt: clock().toISOString(),
    });
  };
  const querySchema = {
    tags: ['learning'],
    querystring: {
      type: 'object',
      properties: {
        windowStart: { type: 'string', format: 'date-time' },
        windowEnd: { type: 'string', format: 'date-time' },
        policyVersion: {
          type: 'string',
          enum: ['learning-dna-policy-v1-synthetic'],
        },
      },
    },
  } as const;

  app.get('/learning/dna/current', { schema: querySchema }, async (request) =>
    calculate(request, { type: 'global', id: null }),
  );
  app.get(
    '/learning/dna/areas/:id',
    {
      schema: {
        ...querySchema,
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', format: 'uuid' } },
        },
      },
    },
    async (request) =>
      calculate(request, {
        type: 'area',
        id: uuidSchema.parse((request.params as { id: string }).id),
      }),
  );
  app.get(
    '/learning/dna/competencies/:id',
    {
      schema: {
        ...querySchema,
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: { type: 'string', format: 'uuid' } },
        },
      },
    },
    async (request) =>
      calculate(request, {
        type: 'competency',
        id: uuidSchema.parse((request.params as { id: string }).id),
      }),
  );
  app.get(
    '/learning/dna/snapshots',
    {
      schema: {
        tags: ['learning'],
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            offset: { type: 'integer', minimum: 0 },
          },
        },
      },
    },
    async (request) =>
      source(request).listSnapshots(catalogQuerySchema.parse(request.query)),
  );
}

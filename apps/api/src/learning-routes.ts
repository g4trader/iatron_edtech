import { catalogQuerySchema } from '@iatron/contracts';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  buildDailySchedule,
  buildTimeline,
  identifyLearningGaps,
} from './learning-engine.js';
import type { LearningRepository } from './learning-repository.js';

export async function registerLearningRoutes(
  app: FastifyInstance,
  repositoryFactory: (token: string) => LearningRepository,
  clock: () => Date = () => new Date(),
) {
  const repository = (request: FastifyRequest) =>
    repositoryFactory(request.auth.accessToken);
  const query = (request: FastifyRequest) =>
    catalogQuerySchema.parse(request.query);
  const schema = {
    tags: ['learning'],
    querystring: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100 },
        offset: { type: 'integer', minimum: 0 },
      },
    },
  } as const;

  app.get('/learning/evidence', { schema }, async (request) =>
    repository(request).listEvidence(query(request)),
  );
  app.get('/learning/mastery', { schema }, async (request) => {
    const input = query(request);
    const mastery = await repository(request).listCurrentMastery();
    return mastery.slice(input.offset, input.offset + input.limit);
  });
  app.get('/learning/gaps', { schema }, async (request) => {
    const input = query(request);
    const source = repository(request);
    const [competencies, mastery] = await Promise.all([
      source.listCompetencies(),
      source.listCurrentMastery(),
    ]);
    return identifyLearningGaps(competencies, mastery, clock()).slice(
      input.offset,
      input.offset + input.limit,
    );
  });
  app.get('/learning/schedule', { schema }, async (request) => {
    const input = query(request);
    const source = repository(request);
    const [competencies, mastery] = await Promise.all([
      source.listCompetencies(),
      source.listCurrentMastery(),
    ]);
    return buildDailySchedule(
      identifyLearningGaps(competencies, mastery, clock()),
      input.limit,
    ).slice(input.offset);
  });
  app.get('/learning/timeline', { schema }, async (request) =>
    buildTimeline(await repository(request).listTimeline(query(request))),
  );
}

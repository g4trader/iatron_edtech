import {
  catalogQuerySchema,
  examRelevanceQuerySchema,
  uuidSchema,
} from '@iatron/contracts';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { ExamIntelligenceRepository } from './exam-intelligence-repository.js';
import {
  buildExamIntelligenceContext,
  explainExamRelevance,
  selectActiveExamProfile,
} from './exam-intelligence-service.js';

const profileParamsSchema = z.object({ profileId: uuidSchema });

export async function registerExamIntelligenceRoutes(
  app: FastifyInstance,
  repositoryFactory: (token: string) => ExamIntelligenceRepository,
  clock: () => Date = () => new Date(),
) {
  const repository = (request: FastifyRequest) =>
    repositoryFactory(request.auth.accessToken);
  const tags = ['exam-intelligence'];
  const notFound = (request: FastifyRequest) => ({
    error: {
      code: 'EXAM_PROFILE_NOT_FOUND',
      message: 'O perfil solicitado não está disponível.',
      requestId: request.id,
    },
  });

  app.get(
    '/exam-intelligence/profiles',
    {
      schema: {
        tags,
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 100 },
            offset: { type: 'integer', minimum: 0 },
          },
        },
      },
    },
    async (request) => {
      const query = catalogQuerySchema.parse(request.query);
      return (await repository(request).listProfiles()).slice(
        query.offset,
        query.offset + query.limit,
      );
    },
  );

  app.get(
    '/exam-intelligence/profiles/:profileId',
    {
      schema: {
        tags,
        params: {
          type: 'object',
          required: ['profileId'],
          properties: { profileId: { type: 'string', format: 'uuid' } },
        },
      },
    },
    async (request, reply) => {
      const { profileId } = profileParamsSchema.parse(request.params);
      const profile = await repository(request).getProfile(profileId);
      return profile ?? reply.status(404).send(notFound(request));
    },
  );

  app.get(
    '/exam-intelligence/profiles/:profileId/blueprint',
    {
      schema: {
        tags,
        params: {
          type: 'object',
          required: ['profileId'],
          properties: { profileId: { type: 'string', format: 'uuid' } },
        },
      },
    },
    async (request, reply) => {
      const { profileId } = profileParamsSchema.parse(request.params);
      const blueprint = await repository(request).getBlueprint(profileId);
      return blueprint ?? reply.status(404).send(notFound(request));
    },
  );

  app.get(
    '/exam-intelligence/profiles/:profileId/relevance',
    {
      schema: {
        tags,
        params: {
          type: 'object',
          required: ['profileId'],
          properties: { profileId: { type: 'string', format: 'uuid' } },
        },
        querystring: {
          type: 'object',
          properties: {
            dimensionType: {
              type: 'string',
              enum: ['large_area', 'area', 'theme', 'subtheme', 'competency'],
            },
            dimensionId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request, reply) => {
      const { profileId } = profileParamsSchema.parse(request.params);
      const parsedQuery = examRelevanceQuerySchema.safeParse(request.query);
      if (!parsedQuery.success)
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Informe o tipo e o conteúdo que deseja consultar.',
            requestId: request.id,
          },
        });
      const query = parsedQuery.data;
      const source = repository(request);
      const [profile, blueprint, statistics] = await Promise.all([
        source.getProfile(profileId),
        source.getBlueprint(profileId),
        source.listStatistics(profileId),
      ]);
      if (!profile || !blueprint)
        return reply.status(404).send(notFound(request));
      return explainExamRelevance(profile, blueprint, statistics, query);
    },
  );

  app.get(
    '/exam-intelligence/context',
    { schema: { tags } },
    async (request) => {
      const source = repository(request);
      const [target, profiles] = await Promise.all([
        source.getTargetExam(),
        source.listProfiles(),
      ]);
      const profile = target
        ? selectActiveExamProfile(profiles, target.programId, clock())
        : null;
      const [blueprint, statistics] = profile
        ? await Promise.all([
            source.getBlueprint(profile.id),
            source.listStatistics(profile.id),
          ])
        : [null, []];
      return buildExamIntelligenceContext({
        target,
        profiles,
        blueprint,
        statistics,
        asOf: clock(),
      });
    },
  );
}

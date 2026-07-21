import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify, { type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import type { ApiEnvironment } from './config/environment.js';

export interface BuildAppOptions {
  environment: ApiEnvironment;
  logger?: boolean;
}

function isFastifyValidationError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'validation' in error;
}

export async function buildApp(
  options: BuildAppOptions,
): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      options.logger === false
        ? false
        : { level: options.environment.LOG_LEVEL },
    requestIdHeader: 'x-request-id',
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Iatron EdTech API',
        description: 'API da plataforma educacional Iatron.',
        version: '0.1.0',
      },
      servers: [{ url: '/v1' }],
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  const statusSchema = {
    type: 'object',
    required: ['status', 'service', 'timestamp'],
    properties: {
      status: { type: 'string', enum: ['ok', 'ready'] },
      service: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
    },
  } as const;

  app.get(
    '/health',
    { schema: { tags: ['operations'], response: { 200: statusSchema } } },
    async () => ({
      status: 'ok' as const,
      service: 'iatron-api',
      timestamp: new Date().toISOString(),
    }),
  );

  app.get(
    '/ready',
    { schema: { tags: ['operations'], response: { 200: statusSchema } } },
    async () => ({
      status: 'ready' as const,
      service: 'iatron-api',
      timestamp: new Date().toISOString(),
    }),
  );

  await app.register(
    async (versionedApi) => {
      versionedApi.get('/', { schema: { tags: ['v1'] } }, async () => ({
        name: 'iatron-api',
        version: 'v1',
      }));
    },
    { prefix: '/v1' },
  );

  app.setNotFoundHandler((request, reply) =>
    reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Recurso não encontrado.',
        requestId: request.id,
      },
    }),
  );

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'request_failed');
    const isValidationError =
      isFastifyValidationError(error) || error instanceof ZodError;
    return reply.status(isValidationError ? 400 : 500).send({
      error: {
        code: isValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR',
        message: isValidationError
          ? 'Dados de entrada inválidos.'
          : 'Erro interno do servidor.',
        requestId: request.id,
      },
    });
  });

  return app;
}

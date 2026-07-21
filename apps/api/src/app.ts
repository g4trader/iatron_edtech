import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify, { type FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import type { ApiEnvironment } from './config/environment.js';
import {
  createAuthenticate,
  createTokenVerifier,
  type TokenVerifier,
} from './auth.js';
import { registerMeRoutes } from './me-routes.js';
import {
  createStudentRepository,
  RepositoryError,
  type StudentRepository,
} from './student-repository.js';

export interface BuildAppOptions {
  environment: ApiEnvironment;
  logger?: boolean;
  tokenVerifier?: TokenVerifier;
  repositoryFactory?: (userId: string, token: string) => StudentRepository;
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

  const allowedOrigins = new Set(
    options.environment.CORS_ALLOWED_ORIGINS.split(',').map((origin) =>
      origin.trim(),
    ),
  );
  await app.register(cors, {
    origin: (origin, callback) =>
      callback(null, !origin || allowedOrigins.has(origin)),
    credentials: true,
    allowedHeaders: ['authorization', 'content-type', 'x-request-id'],
    methods: ['GET', 'PATCH', 'PUT', 'OPTIONS'],
  });

  if (options.environment.ENABLE_API_DOCS === '1') {
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
  }

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
      await versionedApi.register(async (protectedApi) => {
        protectedApi.addHook(
          'preHandler',
          createAuthenticate(
            options.tokenVerifier ?? createTokenVerifier(options.environment),
          ),
        );
        await registerMeRoutes(protectedApi, {
          environment: options.environment,
          repositoryFactory:
            options.repositoryFactory ??
            ((userId, token) =>
              createStudentRepository(options.environment, userId, token)),
        });
      });
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
    if (error instanceof RepositoryError) {
      return reply.status(502).send({
        error: {
          code: 'UPSTREAM_DATABASE_ERROR',
          message: 'Não foi possível acessar os dados.',
          requestId: request.id,
        },
      });
    }
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

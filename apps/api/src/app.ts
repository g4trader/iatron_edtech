import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
import { ZodError } from 'zod';
import type { ApiEnvironment } from './config/environment.js';
import {
  createAuthenticate,
  createTokenVerifier,
  safeUserIdentifier,
  type TokenVerifier,
} from './auth.js';
import { registerMeRoutes } from './me-routes.js';
import {
  createStudentRepository,
  RepositoryError,
  type StudentRepository,
} from './student-repository.js';
import {
  createAcademicRepository,
  type AcademicRepository,
} from './academic-repository.js';
import { registerAcademicRoutes } from './academic-routes.js';
import {
  createLearningRepository,
  type LearningRepository,
} from './learning-repository.js';
import { registerLearningRoutes } from './learning-routes.js';
import {
  createLearningDnaRepository,
  type LearningDnaRepository,
} from './learning-dna-repository.js';
import { registerLearningDnaRoutes } from './learning-dna-routes.js';
import {
  createAssessmentRepository,
  type AssessmentRepository,
} from './assessment-repository.js';
import { registerAssessmentRoutes } from './assessment-routes.js';
import {
  createStudyPlanRepository,
  type StudyPlanRepository,
} from './study-plan-repository.js';
import { registerStudyPlanRoutes } from './study-plan-routes.js';
import { createOpenAiGateway, type AiGateway } from '@iatron/ai';
import {
  createTutorRepository,
  type TutorRepository,
} from './tutor-repository.js';
import { registerTutorRoutes } from './tutor-routes.js';
import {
  createExamIntelligenceRepository,
  type ExamIntelligenceRepository,
} from './exam-intelligence-repository.js';
import { registerExamIntelligenceRoutes } from './exam-intelligence-routes.js';
import {
  createEditorialRepository,
  type EditorialRepository,
} from './editorial-repository.js';
import { registerEditorialRoutes } from './editorial-routes.js';
import {
  createResendEditorialEmailGateway,
  type EditorialEmailGateway,
} from './editorial-email.js';
import {
  createAdminRepository,
  type AdminRepository,
} from './admin-repository.js';
import { registerAdminRoutes } from './admin-routes.js';
import {
  classifyError,
  OperationalState,
  requestId,
  safeErrorLog,
} from './observability.js';

export interface BuildAppOptions {
  environment: ApiEnvironment;
  logger?: boolean;
  tokenVerifier?: TokenVerifier;
  repositoryFactory?: (userId: string, token: string) => StudentRepository;
  academicRepositoryFactory?: (token: string) => AcademicRepository;
  learningRepositoryFactory?: (token: string) => LearningRepository;
  learningDnaRepositoryFactory?: (token: string) => LearningDnaRepository;
  learningDnaClock?: () => Date;
  assessmentRepositoryFactory?: (token: string) => AssessmentRepository;
  studyPlanRepositoryFactory?: (token: string) => StudyPlanRepository;
  studyPlanClock?: () => Date;
  learningClock?: () => Date;
  tutorRepositoryFactory?: (token: string) => TutorRepository;
  aiGateway?: AiGateway;
  tutorClock?: () => number;
  examIntelligenceRepositoryFactory?: (
    token: string,
  ) => ExamIntelligenceRepository;
  examIntelligenceClock?: () => Date;
  editorialRepositoryFactory?: (token: string) => EditorialRepository;
  editorialEmailGateway?: EditorialEmailGateway;
  adminRepositoryFactory?: () => AdminRepository;
  operationalState?: OperationalState;
  readinessCheck?: () => Promise<boolean>;
}

function isFastifyValidationError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('validation' in error ||
      ('issues' in error &&
        Array.isArray((error as { issues?: unknown }).issues)))
  );
}

export async function buildApp(
  options: BuildAppOptions,
): Promise<FastifyInstance> {
  const operations = options.operationalState ?? new OperationalState();
  const app = Fastify({
    logger:
      options.logger === false
        ? false
        : {
            level: options.environment.LOG_LEVEL,
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'headers.authorization',
                'headers.cookie',
                '*.password',
                '*.token',
                '*.secret',
              ],
              censor: '[REDACTED]',
            },
          },
    requestIdHeader: false,
    genReqId: (request) =>
      requestId(
        typeof request.headers['x-request-id'] === 'string'
          ? request.headers['x-request-id']
          : undefined,
      ),
  });
  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });
  app.addHook('onResponse', async (request, reply) => {
    const duration = Math.round(reply.elapsedTime);
    const statusCode = reply.statusCode;
    operations.recordResponse({
      requestId: request.id,
      route: request.routeOptions.url ?? request.url,
      statusCode,
      frontendSha:
        typeof request.headers['x-frontend-sha'] === 'string'
          ? request.headers['x-frontend-sha']
          : undefined,
    });
    request.log.info(
      {
        event: 'request_completed',
        timestamp: new Date().toISOString(),
        environment: options.environment.APP_ENV,
        service: 'iatron-api',
        request_id: request.id,
        route: request.routeOptions.url,
        method: request.method,
        status_code: statusCode,
        duration_ms: duration,
        actor_id: request.auth?.userId
          ? safeUserIdentifier(request.auth.userId)
          : undefined,
        frontend_sha:
          typeof request.headers['x-frontend-sha'] === 'string' &&
          /^[a-f0-9]{7,40}$/i.test(request.headers['x-frontend-sha'])
            ? request.headers['x-frontend-sha']
            : undefined,
        api_sha: options.environment.BUILD_SHA,
      },
      'request_completed',
    );
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
    allowedHeaders: [
      'authorization',
      'content-type',
      'x-request-id',
      'x-frontend-sha',
    ],
    exposedHeaders: ['x-request-id'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'OPTIONS'],
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
    required: [
      'status',
      'service',
      'timestamp',
      'buildSha',
      'contractVersion',
      'migrationBaseline',
    ],
    properties: {
      status: { type: 'string', enum: ['ok', 'ready'] },
      service: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
      buildSha: { type: 'string' },
      contractVersion: { type: 'string', const: 'journey-v1' },
      migrationBaseline: { type: 'string' },
    },
  } as const;

  const handleError = (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const classification = classifyError(error);
    request.log.error(
      safeErrorLog(error, request, classification),
      'request_failed',
    );
    if (error instanceof RepositoryError) {
      operations.dependencyFailure('supabase');
      return reply.status(502).send({
        error: {
          code: 'DATABASE_ERROR',
          message: 'Não foi possível acessar os dados.',
          requestId: request.id,
          retryable: true,
        },
      });
    }
    const isValidationError =
      isFastifyValidationError(error) || error instanceof ZodError;
    const mapped = isValidationError
      ? {
          code: 'VALIDATION_ERROR',
          status: 400,
          retryable: false,
          message: 'Dados de entrada inválidos.',
        }
      : classification;
    return reply.status(mapped.status).send({
      error: {
        code: mapped.code,
        message: mapped.message,
        requestId: request.id,
        retryable: mapped.retryable,
      },
    });
  };
  app.setErrorHandler(handleError);

  app.get(
    '/health',
    { schema: { tags: ['operations'], response: { 200: statusSchema } } },
    async () => ({
      status: 'ok' as const,
      service: 'iatron-api',
      timestamp: new Date().toISOString(),
      buildSha: options.environment.BUILD_SHA,
      contractVersion: 'journey-v1',
      migrationBaseline: options.environment.MIGRATION_BASELINE,
    }),
  );

  app.get(
    '/ready',
    { schema: { tags: ['operations'] } },
    async (_request, reply) => {
      let ready = true;
      try {
        ready =
          (await options.readinessCheck?.()) ??
          (options.environment.APP_ENV === 'local'
            ? true
            : (
                await fetch(
                  `${options.environment.SUPABASE_URL}/rest/v1/institutions?select=id&limit=1`,
                  {
                    headers: {
                      apikey:
                        options.environment.SUPABASE_SERVICE_ROLE_KEY ??
                        options.environment.SUPABASE_PUBLISHABLE_KEY,
                      authorization: `Bearer ${
                        options.environment.SUPABASE_SERVICE_ROLE_KEY ??
                        options.environment.SUPABASE_PUBLISHABLE_KEY
                      }`,
                    },
                    signal: AbortSignal.timeout(2_000),
                  },
                )
              ).ok);
      } catch {
        ready = false;
      }
      if (!ready) operations.dependencyFailure('supabase');
      return reply.status(ready ? 200 : 503).send({
        status: ready ? 'ready' : 'unavailable',
        service: 'iatron-api',
        timestamp: new Date().toISOString(),
        buildSha: options.environment.BUILD_SHA,
        contractVersion: 'journey-v1',
        migrationBaseline: options.environment.MIGRATION_BASELINE,
      });
    },
  );

  await app.register(
    async (versionedApi) => {
      versionedApi.get('/', { schema: { tags: ['v1'] } }, async () => ({
        name: 'iatron-api',
        version: 'v1',
      }));
      versionedApi.get(
        '/meta',
        { schema: { tags: ['operations'] } },
        async () => ({
          service: 'iatron-api',
          environment: options.environment.APP_ENV,
          apiSha: options.environment.BUILD_SHA,
          schemaVersion: options.environment.MIGRATION_BASELINE,
          cloudRunRevision: options.environment.CLOUD_RUN_REVISION ?? null,
          buildTimestamp: options.environment.BUILD_TIMESTAMP,
        }),
      );
      await versionedApi.register(async (protectedApi) => {
        protectedApi.setErrorHandler(handleError);
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
        await registerAcademicRoutes(
          protectedApi,
          options.academicRepositoryFactory ??
            ((token) => createAcademicRepository(options.environment, token)),
        );
        await registerLearningRoutes(
          protectedApi,
          options.learningRepositoryFactory ??
            ((token) => createLearningRepository(options.environment, token)),
          options.learningClock,
        );
        await registerLearningDnaRoutes(
          protectedApi,
          options.learningDnaRepositoryFactory ??
            ((token) =>
              createLearningDnaRepository(options.environment, token)),
          options.learningDnaClock,
        );
        await registerAssessmentRoutes(
          protectedApi,
          options.assessmentRepositoryFactory ??
            ((token) => createAssessmentRepository(options.environment, token)),
          options.learningRepositoryFactory ??
            ((token) => createLearningRepository(options.environment, token)),
          options.examIntelligenceRepositoryFactory ??
            ((token) =>
              createExamIntelligenceRepository(options.environment, token)),
        );
        await registerStudyPlanRoutes(
          protectedApi,
          options.studyPlanRepositoryFactory ??
            ((token) => createStudyPlanRepository(options.environment, token)),
          options.learningRepositoryFactory ??
            ((token) => createLearningRepository(options.environment, token)),
          options.studyPlanClock,
        );
        await registerTutorRoutes(protectedApi, {
          environment: options.environment,
          repositoryFactory:
            options.tutorRepositoryFactory ??
            ((token) => createTutorRepository(options.environment, token)),
          gateway:
            options.aiGateway ??
            createOpenAiGateway({
              apiKey: options.environment.OPENAI_API_KEY,
              model: options.environment.OPENAI_MODEL,
              timeoutMs: options.environment.OPENAI_REQUEST_TIMEOUT_MS,
            }),
          clock: options.tutorClock,
          onDependencyFailure: () => operations.dependencyFailure('openai'),
        });
        await registerExamIntelligenceRoutes(
          protectedApi,
          options.examIntelligenceRepositoryFactory ??
            ((token) =>
              createExamIntelligenceRepository(options.environment, token)),
          options.examIntelligenceClock,
        );
        await registerEditorialRoutes(
          protectedApi,
          options.editorialRepositoryFactory ??
            ((token) => createEditorialRepository(options.environment, token)),
          options.editorialEmailGateway ??
            createResendEditorialEmailGateway(options.environment, (event) => {
              if (!event.success) operations.dependencyFailure('email');
              app.log.info(
                {
                  event: 'dependency_call',
                  request_id: 'background',
                  ...event,
                },
                'dependency_call',
              );
            }),
        );
        await registerAdminRoutes(
          protectedApi,
          options.adminRepositoryFactory ??
            (() => createAdminRepository(options.environment)),
          operations,
        );
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
        retryable: false,
      },
    }),
  );

  return app;
}

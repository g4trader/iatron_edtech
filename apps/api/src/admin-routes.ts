import {
  adminInviteUserSchema,
  adminRolesUpdateSchema,
} from '@iatron/contracts';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  AdminRepositoryError,
  type AdminRepository,
} from './admin-repository.js';

const uuid = z.uuid();
const requestId = (request: FastifyRequest) =>
  String(request.headers['x-request-id'] ?? request.id);
const userId = (request: FastifyRequest) =>
  uuid.parse((request.params as { id: string }).id);

const failures = new Map<string, { count: number; resetAt: number }>();
function enforceMutationRateLimit(request: FastifyRequest) {
  const key = request.auth.userId;
  const now = Date.now();
  const current = failures.get(key);
  if (!current || current.resetAt <= now) {
    failures.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (current.count >= 20)
    throw new AdminRepositoryError(
      'ADMIN_RATE_LIMITED',
      'Muitas operações administrativas em sequência.',
    );
  current.count += 1;
}

function sendAdminError(
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!(error instanceof AdminRepositoryError)) throw error;
  request.log.error(
    {
      adminErrorCode: error.code,
      operation: error.context?.operation,
      upstreamStatus: error.context?.upstreamStatus,
    },
    'admin operation failed',
  );
  const status =
    error.code === 'ADMIN_FORBIDDEN' ||
    error.code === 'ADMIN_ACCOUNT_DISABLED' ||
    error.code === 'ADMIN_ELEVATED_REQUIRED'
      ? 403
      : error.code === 'ADMIN_NOT_FOUND' ||
          error.code === 'ADMIN_ACTOR_NOT_FOUND'
        ? 404
        : error.code === 'ADMIN_RATE_LIMITED'
          ? 429
          : error.code.includes('CONFLICT') ||
              error.code.includes('LAST_ACTIVE') ||
              error.code.includes('SELF_')
            ? 409
            : 503;
  return reply.status(status).send({
    error: {
      code: error.code,
      message: error.message,
      requestId: request.id,
    },
  });
}

export async function registerAdminRoutes(
  app: FastifyInstance,
  factory: () => AdminRepository,
) {
  const repository = () => factory();
  const execute = async <T>(
    request: FastifyRequest,
    reply: FastifyReply,
    operation: (repo: AdminRepository) => Promise<T>,
  ) => {
    try {
      return await operation(repository());
    } catch (error) {
      return sendAdminError(error, request, reply);
    }
  };

  app.get('/admin/overview', (request, reply) =>
    execute(request, reply, (repo) => repo.overview(request.auth.userId)),
  );
  app.get('/admin/students', (request, reply) =>
    execute(request, reply, (repo) => {
      const query = z
        .object({
          page: z.coerce.number().int().positive().default(1),
          pageSize: z.coerce.number().int().min(1).max(50).default(20),
          search: z.string().trim().max(100).optional(),
          status: z.enum(['active', 'disabled']).optional(),
          sort: z.enum(['name', 'created', 'lastAccess']).default('lastAccess'),
        })
        .parse(request.query);
      return repo.students(request.auth.userId, query);
    }),
  );
  app.get('/admin/students/:id', (request, reply) =>
    execute(request, reply, async (repo) => {
      const result = await repo.student(
        request.auth.userId,
        userId(request),
        requestId(request),
      );
      return result ?? reply.status(404).send();
    }),
  );
  app.get('/admin/mentors', (request, reply) =>
    execute(request, reply, (repo) => repo.mentors(request.auth.userId)),
  );
  app.get('/admin/mentors/:id', (request, reply) =>
    execute(request, reply, async (repo) => {
      const result = await repo.mentor(request.auth.userId, userId(request));
      return result ?? reply.status(404).send();
    }),
  );
  app.get('/admin/users', (request, reply) =>
    execute(request, reply, (repo) => repo.users(request.auth.userId)),
  );
  app.get('/admin/audit', (request, reply) =>
    execute(request, reply, (repo) => repo.auditEvents(request.auth.userId)),
  );

  app.post('/admin/users/invite', (request, reply) =>
    execute(request, reply, async (repo) => {
      enforceMutationRateLimit(request);
      const result = await repo.invite(
        request.auth.userId,
        adminInviteUserSchema.parse(request.body),
        requestId(request),
      );
      return reply.status(201).send(result);
    }),
  );
  app.post('/admin/users/:id/disable', (request, reply) =>
    execute(request, reply, async (repo) => {
      enforceMutationRateLimit(request);
      return repo.setEnabled(
        request.auth.userId,
        userId(request),
        false,
        requestId(request),
      );
    }),
  );
  app.post('/admin/users/:id/enable', (request, reply) =>
    execute(request, reply, async (repo) => {
      enforceMutationRateLimit(request);
      return repo.setEnabled(
        request.auth.userId,
        userId(request),
        true,
        requestId(request),
      );
    }),
  );
  app.post('/admin/users/:id/reset-access', (request, reply) =>
    execute(request, reply, async (repo) => {
      enforceMutationRateLimit(request);
      return repo.resetAccess(
        request.auth.userId,
        userId(request),
        requestId(request),
      );
    }),
  );
  app.post('/admin/users/:id/roles', (request, reply) =>
    execute(request, reply, async (repo) => {
      enforceMutationRateLimit(request);
      const input = adminRolesUpdateSchema.parse(request.body);
      return repo.updateRoles(
        request.auth.userId,
        userId(request),
        input.roles,
        requestId(request),
      );
    }),
  );
}

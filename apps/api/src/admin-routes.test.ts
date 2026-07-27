import { describe, expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';
import {
  AdminRepositoryError,
  type AdminRepository,
} from './admin-repository.js';

const actorId = '10000000-0000-4000-8000-000000000001';
const targetId = '10000000-0000-4000-8000-000000000002';
const metric = { value: null, available: false, note: 'Indisponível.' };
const overview = {
  generatedAt: new Date().toISOString(),
  students: {
    registered: 1,
    activeLast30Days: 1,
    newToday: 0,
    diagnosticsCompleted: 1,
    diagnosticsInProgress: 0,
    activePlans: 1,
    activitiesCompleted: 2,
    completionRate: 0.5,
    inactive: 0,
  },
  mentors: { active: 1, awaitingReview: 1, pendingRequests: 0 },
  editorial: {
    published: 1,
    drafts: 1,
    inReview: 1,
    readyToPublish: 0,
    pendingReferences: 0,
    newVersionsLast30Days: 1,
  },
  ai: {
    drafts: 1,
    awaitingReview: 1,
    approved: 0,
    rejected: 0,
    queued: 0,
    usage: { value: 120, available: true, note: 'Tokens registrados.' },
  },
  platform: {
    health: 'ok' as const,
    ready: 'ready' as const,
    buildSha: 'test',
    migrationBaseline: '202607250005',
    failures: metric,
    averageResponseTimeMs: metric,
  },
};

function repository(overrides: Partial<AdminRepository> = {}): AdminRepository {
  return {
    authorize: vi.fn(async () => ({
      roles: ['admin'],
      elevated: false,
      role: 'admin',
    })),
    overview: vi.fn(async () => overview),
    students: vi.fn(async (_actor, query) => ({
      items: [],
      page: query.page,
      pageSize: query.pageSize,
      total: 0,
    })),
    student: vi.fn(async () => null),
    mentors: vi.fn(async () => ({ items: [], total: 0 })),
    mentor: vi.fn(async () => null),
    users: vi.fn(async () => ({ items: [], total: 0 })),
    invite: vi.fn(async () => ({ id: targetId, status: 'invited' })),
    setEnabled: vi.fn(async (_actor, id, enabled) => ({
      id,
      status: enabled ? 'active' : 'disabled',
    })),
    resetAccess: vi.fn(async () => ({
      id: targetId,
      status: 'recovery_requested',
    })),
    updateRoles: vi.fn(async () => ({
      id: targetId,
      status: 'roles_updated',
    })),
    auditEvents: vi.fn(async () => []),
    ...overrides,
  } as AdminRepository;
}

const server = (repo: AdminRepository, authenticated = true) =>
  buildApp({
    environment: readEnvironment(),
    logger: false,
    tokenVerifier: async () => {
      if (!authenticated) throw new Error('expired');
      return { sub: actorId };
    },
    adminRepositoryFactory: () => repo,
  });

describe('administrative routes', () => {
  it('returns 401 without a valid JWT', async () => {
    const app = await server(repository());
    expect((await app.inject({ url: '/v1/admin/overview' })).statusCode).toBe(
      401,
    );
    await app.close();
  });

  it.each(['student', 'mentor', 'editor'])(
    'returns 403 to the %s role',
    async (role) => {
      const app = await server(
        repository({
          overview: vi.fn(async () => {
            throw new AdminRepositoryError(
              'ADMIN_FORBIDDEN',
              `${role} forbidden`,
            );
          }),
        }),
      );
      expect(
        (
          await app.inject({
            url: '/v1/admin/overview',
            headers: { authorization: 'Bearer valid' },
          })
        ).statusCode,
      ).toBe(403);
      await app.close();
    },
  );

  it.each(['student', 'mentor', 'editor'])(
    'blocks the %s role from operational data',
    async (role) => {
      const app = await server(
        repository({
          authorize: vi.fn(async () => {
            throw new AdminRepositoryError(
              'ADMIN_FORBIDDEN',
              `${role} forbidden`,
            );
          }),
        }),
      );
      expect(
        (
          await app.inject({
            url: '/v1/admin/operations',
            headers: { authorization: 'Bearer valid' },
          })
        ).statusCode,
      ).toBe(403);
      await app.close();
    },
  );

  it('returns minimized operational data to an admin', async () => {
    const app = await server(repository());
    const response = await app.inject({
      url: '/v1/admin/operations',
      headers: {
        authorization: 'Bearer valid',
        'x-frontend-sha': '068a522',
      },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      errors5xxLastHour: 0,
      recentErrors: [],
    });
    expect(response.body).not.toMatch(/authorization|cookie|service.?role/i);
    await app.close();
  });

  it('returns real overview data to an active admin', async () => {
    const app = await server(repository());
    const response = await app.inject({
      url: '/v1/admin/overview',
      headers: { authorization: 'Bearer valid' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().students.registered).toBe(1);
    expect(JSON.stringify(response.json())).not.toContain('service-role');
    await app.close();
  });

  it('validates pagination and invitation payloads', async () => {
    const app = await server(repository());
    const headers = { authorization: 'Bearer valid' };
    expect(
      (
        await app.inject({
          url: '/v1/admin/students?pageSize=1000',
          headers,
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/v1/admin/users/invite',
          headers,
          payload: {
            email: 'beta@example.test',
            displayName: 'Beta',
            role: 'student',
          },
        })
      ).statusCode,
    ).toBe(400);
    await app.close();
  });

  it('supports invite, disable, enable, recovery and confirmed role change', async () => {
    const repo = repository();
    const app = await server(repo);
    const headers = {
      authorization: 'Bearer valid',
      'x-request-id': crypto.randomUUID(),
    };
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/v1/admin/users/invite',
          headers,
          payload: {
            email: 'mentor@example.test',
            displayName: 'Mentor Beta',
            role: 'mentor',
          },
        })
      ).statusCode,
    ).toBe(201);
    for (const action of ['disable', 'enable', 'reset-access'])
      expect(
        (
          await app.inject({
            method: 'POST',
            url: `/v1/admin/users/${targetId}/${action}`,
            headers,
          })
        ).statusCode,
      ).toBe(200);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/v1/admin/users/${targetId}/roles`,
          headers,
          payload: { roles: ['mentor'], confirmed: true },
        })
      ).statusCode,
    ).toBe(200);
    expect(repo.invite).toHaveBeenCalled();
    expect(repo.setEnabled).toHaveBeenCalledTimes(2);
    expect(repo.resetAccess).toHaveBeenCalled();
    expect(repo.updateRoles).toHaveBeenCalled();
    await app.close();
  });

  it.each([
    'ADMIN_ACCOUNT_DISABLED',
    'ADMIN_LAST_ACTIVE',
    'ADMIN_SELF_DISABLE',
  ])('fails safely for %s', async (code) => {
    const app = await server(
      repository({
        setEnabled: vi.fn(async () => {
          throw new AdminRepositoryError(code, 'Operação protegida.');
        }),
      }),
    );
    const response = await app.inject({
      method: 'POST',
      url: `/v1/admin/users/${targetId}/disable`,
      headers: { authorization: 'Bearer valid' },
    });
    expect([403, 409]).toContain(response.statusCode);
    expect(response.json().error).not.toHaveProperty('stack');
    await app.close();
  });
});

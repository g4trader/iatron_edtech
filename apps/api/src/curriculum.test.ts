import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createCurriculumRepository,
  registerCurriculumRoutes,
} from './curriculum.js';
import { readEnvironment } from './config/environment.js';
import Fastify from 'fastify';
const environment = readEnvironment({
  BUILD_TIMESTAMP: '2026-10-28T00:00:00.000Z',
});
afterEach(() => vi.unstubAllGlobals());
describe('curriculum API authorization and validation', () => {
  it('propagates database role rejection without exposing backend details', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              code: '42501',
              message: 'private internal detail',
            }),
            { status: 403 },
          ),
        ),
    );
    const app = Fastify();
    app.addHook('preHandler', async (request) => {
      request.auth = {
        accessToken: 'test-token',
        userId: '88000000-0000-4000-8000-000000000001',
      };
    });
    await registerCurriculumRoutes(app, (token) =>
      createCurriculumRepository(environment, token),
    );
    const response = await app.inject('/admin/curriculum');
    expect(response.statusCode).toBe(403);
    expect(response.body).not.toContain('private internal detail');
    await app.close();
  });
  it('uses the caller JWT and a parameterized body for search', async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ code: '42501' }), { status: 403 }),
      );
    vi.stubGlobal('fetch', request);
    await expect(
      createCurriculumRepository(environment, 'caller-jwt').list({
        search: "%'); DROP TABLE competencies; --",
        page: 1,
        coverage: '',
        missing: '',
        status: '',
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(request.mock.calls[0]?.[1]).toMatchObject({
      headers: { authorization: 'Bearer caller-jwt' },
    });
    expect(
      JSON.parse(request.mock.calls[0]?.[1].body).p_query.search,
    ).toContain('DROP TABLE');
  });
  it('rejects unsupported activation and approval fields before persistence', async () => {
    const { saveCurriculumSchema } = await import('@iatron/contracts');
    expect(
      saveCurriculumSchema.safeParse({ active: true, status: 'approved' })
        .success,
    ).toBe(false);
  });
});

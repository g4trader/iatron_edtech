import { describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';

describe('operational contracts', () => {
  it('returns and propagates a valid request ID', async () => {
    const app = await buildApp({
      environment: readEnvironment(),
      logger: false,
    });
    const response = await app.inject({
      url: '/health',
      headers: { 'x-request-id': 'support_ABC-123' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['x-request-id']).toBe('support_ABC-123');
    await app.close();
  });

  it('replaces an unsafe request ID', async () => {
    const app = await buildApp({
      environment: readEnvironment(),
      logger: false,
    });
    const response = await app.inject({
      url: '/health',
      headers: { 'x-request-id': 'Bearer private' },
    });
    expect(response.headers['x-request-id']).not.toBe('Bearer private');
    await app.close();
  });

  it('exposes safe release metadata and no secrets', async () => {
    const app = await buildApp({
      environment: readEnvironment({
        BUILD_SHA: 'abc1234',
        APP_ENV: 'staging',
        MIGRATION_BASELINE: '202607260001',
        BUILD_TIMESTAMP: '2026-07-27T10:00:00.000Z',
        K_REVISION: 'iatron-api-staging-00034-g5b',
      }),
      logger: false,
    });
    const response = await app.inject({ url: '/v1/meta' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      service: 'iatron-api',
      environment: 'staging',
      apiSha: 'abc1234',
      schemaVersion: '202607260001',
      cloudRunRevision: 'iatron-api-staging-00034-g5b',
      buildTimestamp: '2026-07-27T10:00:00.000Z',
    });
    expect(response.body).not.toMatch(/secret|token|service.?role/i);
    await app.close();
  });

  it('returns 503 when the minimum readiness check fails', async () => {
    const app = await buildApp({
      environment: readEnvironment(),
      readinessCheck: async () => false,
      logger: false,
    });
    const response = await app.inject({ url: '/ready' });
    expect(response.statusCode).toBe(503);
    expect(response.json().status).toBe('unavailable');
    await app.close();
  });

  it('returns a safe error payload without stack traces', async () => {
    const app = await buildApp({
      environment: readEnvironment(),
      logger: false,
    });
    const response = await app.inject({ url: '/missing' });
    expect(response.statusCode).toBe(404);
    expect(response.headers['x-request-id']).toBe(
      response.json().error.requestId,
    );
    expect(response.body).not.toContain('stack');
    await app.close();
  });
});

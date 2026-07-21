import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FastifyInstance } from 'fastify';
import { readEnvironment } from '../src/config/environment.js';
import type { StudentRepository } from '../src/student-repository.js';

const environment = readEnvironment({
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: '8080',
  LOG_LEVEL: 'silent',
});
let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe('operational routes', () => {
  it('returns health status', async () => {
    app = await buildApp({ environment, logger: false });
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok',
      service: 'iatron-api',
    });
  });

  it('exposes the versioned API and OpenAPI document', async () => {
    app = await buildApp({ environment, logger: false });
    expect((await app.inject({ method: 'GET', url: '/v1' })).statusCode).toBe(
      200,
    );
    expect(
      (await app.inject({ method: 'GET', url: '/docs/json' })).statusCode,
    ).toBe(200);
  });
});

describe('authenticated routes', () => {
  const repository = {
    getOnboarding: async () => ({ profile: { id: 'user-a' } }),
    getProfile: async () => ({ id: 'user-a', display_name: 'Ana' }),
  } as unknown as StudentRepository;

  it('rejects a request without bearer token', async () => {
    app = await buildApp({
      environment,
      logger: false,
      tokenVerifier: async () => ({ sub: 'user-a' }),
      repositoryFactory: () => repository,
    });
    expect(
      (await app.inject({ method: 'GET', url: '/v1/me' })).statusCode,
    ).toBe(401);
  });

  it('derives the user from a verified token', async () => {
    let requestedUser = '';
    app = await buildApp({
      environment,
      logger: false,
      tokenVerifier: async () => ({ sub: 'user-a', aud: 'authenticated' }),
      repositoryFactory: (userId) => {
        requestedUser = userId;
        return repository;
      },
    });
    const response = await app.inject({
      method: 'GET',
      url: '/v1/me',
      headers: { authorization: 'Bearer valid-test-token' },
    });
    expect(response.statusCode).toBe(200);
    expect(requestedUser).toBe('user-a');
  });

  it('rejects a token without subject', async () => {
    app = await buildApp({
      environment,
      logger: false,
      tokenVerifier: async () => ({}),
      repositoryFactory: () => repository,
    });
    expect(
      (
        await app.inject({
          method: 'GET',
          url: '/v1/me',
          headers: { authorization: 'Bearer invalid-token' },
        })
      ).statusCode,
    ).toBe(401);
  });
});

describe('CORS allowlist', () => {
  it('allows configured origins and authorization preflight', async () => {
    app = await buildApp({ environment, logger: false });
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/v1/me',
      headers: {
        origin: 'http://localhost:3000',
        'access-control-request-method': 'GET',
        'access-control-request-headers': 'authorization',
      },
    });
    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    expect(response.headers['access-control-allow-headers']).toContain(
      'authorization',
    );
  });

  it('does not grant browser access to an unknown origin', async () => {
    app = await buildApp({ environment, logger: false });
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://unknown.invalid' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('allows server-to-server requests without Origin', async () => {
    app = await buildApp({ environment, logger: false });
    expect(
      (await app.inject({ method: 'GET', url: '/health' })).statusCode,
    ).toBe(200);
  });
});

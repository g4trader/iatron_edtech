import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FastifyInstance } from 'fastify';

const environment = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 8080,
  LOG_LEVEL: 'silent',
} as const;
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

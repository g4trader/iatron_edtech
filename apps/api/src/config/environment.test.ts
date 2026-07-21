import { describe, expect, it } from 'vitest';
import { readEnvironment } from './environment.js';

describe('readEnvironment', () => {
  it('uses Cloud Run compatible defaults', () => {
    expect(readEnvironment({ NODE_ENV: 'test' })).toMatchObject({
      HOST: '0.0.0.0',
      PORT: 8080,
    });
  });

  it('rejects an invalid port', () => {
    expect(() =>
      readEnvironment({ NODE_ENV: 'test', PORT: 'invalid' }),
    ).toThrow();
  });

  it('rejects a wildcard CORS origin', () => {
    expect(() =>
      readEnvironment({ NODE_ENV: 'test', CORS_ALLOWED_ORIGINS: '*' }),
    ).toThrow();
  });
});

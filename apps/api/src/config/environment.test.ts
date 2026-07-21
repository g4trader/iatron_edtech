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

  it('refuses local defaults in a production runtime', () => {
    expect(() => readEnvironment({ NODE_ENV: 'production' })).toThrow(
      /Missing production configuration/,
    );
  });

  it('accepts an explicit staging production runtime', () => {
    expect(
      readEnvironment({
        NODE_ENV: 'production',
        APP_ENV: 'staging',
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_PUBLISHABLE_KEY: 'public-key',
        SUPABASE_JWT_ISSUER: 'https://example.supabase.co/auth/v1',
        CORS_ALLOWED_ORIGINS: 'https://staging.example.com',
      }),
    ).toMatchObject({ APP_ENV: 'staging', ENABLE_API_DOCS: '0' });
  });
});

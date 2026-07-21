import { nodeEnvironmentSchema, parseEnvironment } from '@iatron/config';
import { z } from 'zod';

const apiEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema.default('development'),
  APP_ENV: z.enum(['local', 'staging', 'production']).default('local'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().max(65_535).default(8080),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  ENABLE_API_DOCS: z.enum(['0', '1']).default('0'),
  SUPABASE_URL: z.url().default('http://127.0.0.1:54321'),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).default('local-development-key'),
  SUPABASE_JWT_ISSUER: z.url().default('http://127.0.0.1:54321/auth/v1'),
  SUPABASE_JWT_AUDIENCE: z.string().min(1).default('authenticated'),
  SUPABASE_JWT_ALGORITHMS: z.string().default('ES256,RS256'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .refine(
      (value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .every((origin) => origin.length > 0 && origin !== '*'),
      'CORS_ALLOWED_ORIGINS must contain explicit origins',
    )
    .default('http://localhost:3000'),
});

export type ApiEnvironment = z.output<typeof apiEnvironmentSchema>;

export function readEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): ApiEnvironment {
  if (environment.NODE_ENV === 'production') {
    const required = [
      'APP_ENV',
      'SUPABASE_URL',
      'SUPABASE_PUBLISHABLE_KEY',
      'SUPABASE_JWT_ISSUER',
      'CORS_ALLOWED_ORIGINS',
    ];
    const missing = required.filter((name) => !environment[name]?.trim());
    if (missing.length > 0) {
      throw new Error(
        `Missing production configuration: ${missing.join(', ')}`,
      );
    }
    if (environment.APP_ENV === 'local') {
      throw new Error('Production runtime cannot use APP_ENV=local');
    }
  }
  return parseEnvironment(apiEnvironmentSchema, environment);
}

import { nodeEnvironmentSchema, parseEnvironment } from '@iatron/config';
import { z } from 'zod';

const apiEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema.default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().max(65_535).default(8080),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
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
  return parseEnvironment(apiEnvironmentSchema, environment);
}

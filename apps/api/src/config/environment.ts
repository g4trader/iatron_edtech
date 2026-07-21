import { nodeEnvironmentSchema, parseEnvironment } from '@iatron/config';
import { z } from 'zod';

const apiEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema.default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().max(65_535).default(8080),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

export type ApiEnvironment = z.output<typeof apiEnvironmentSchema>;

export function readEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): ApiEnvironment {
  return parseEnvironment(apiEnvironmentSchema, environment);
}

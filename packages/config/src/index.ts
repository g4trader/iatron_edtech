import { z } from 'zod';

export const nodeEnvironmentSchema = z.enum([
  'development',
  'test',
  'production',
]);

export function parseEnvironment<TSchema extends z.ZodType>(
  schema: TSchema,
  environment: unknown,
): z.output<TSchema> {
  return schema.parse(environment);
}

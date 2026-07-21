import { z } from 'zod';

export const serviceStatusSchema = z.object({
  status: z.enum(['ok', 'ready']),
  service: z.string().min(1),
  timestamp: z.iso.datetime(),
});

export type ServiceStatus = z.infer<typeof serviceStatusSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

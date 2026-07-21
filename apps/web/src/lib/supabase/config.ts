import { z } from 'zod';

const schema = z.object({ url: z.url(), key: z.string().min(1) });

export function getSupabaseConfig() {
  return schema.parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321',
    key:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      'local-development-key',
  });
}

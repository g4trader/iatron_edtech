import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';

export type { Database } from './database.types.js';

export interface DatabaseClientOptions {
  url: string;
  key: string;
  accessToken?: () => Promise<string | null>;
}

export function createDatabaseClient(
  options: DatabaseClientOptions,
): SupabaseClient<Database> {
  return createClient<Database>(options.url, options.key, {
    accessToken: options.accessToken,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

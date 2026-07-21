import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface DatabaseClientOptions {
  url: string;
  serviceRoleKey: string;
}

export function createDatabaseClient(
  options: DatabaseClientOptions,
): SupabaseClient {
  return createClient(options.url, options.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

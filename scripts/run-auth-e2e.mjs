import { spawnSync } from 'node:child_process';
import {
  assertStagingTarget,
  assertSupabaseUrlMatches,
  requiredEnvironment,
} from './cloud-environment.mjs';

const remoteWebUrl = process.env.E2E_WEB_BASE_URL?.trim();

if (remoteWebUrl) {
  const projectRef = assertStagingTarget({ destructive: true });
  const supabaseUrl = requiredEnvironment('E2E_SUPABASE_URL');
  assertSupabaseUrlMatches(supabaseUrl, projectRef);
  requiredEnvironment('E2E_API_BASE_URL');
  requiredEnvironment('E2E_SUPABASE_PUBLISHABLE_KEY');
  requiredEnvironment('E2E_SUPABASE_SERVICE_ROLE_KEY');
  const result = spawnSync(
    'pnpm',
    ['--filter', '@iatron/web', 'test:e2e:auth:direct'],
    { stdio: 'inherit', env: process.env },
  );
  process.exit(result.status ?? 1);
}

const status = spawnSync('pnpm', ['exec', 'supabase', 'status', '-o', 'json'], {
  encoding: 'utf8',
  timeout: 15_000,
});
if (status.status !== 0) {
  console.error('Supabase local não está disponível. Execute pnpm db:start.');
  process.exit(1);
}

let local;
try {
  local = JSON.parse(status.stdout);
} catch {
  console.error('A Supabase CLI não retornou um status JSON válido.');
  process.exit(1);
}

const supabaseUrl = local.API_URL;
const publishableKey = local.PUBLISHABLE_KEY ?? local.ANON_KEY;
if (typeof supabaseUrl !== 'string' || typeof publishableKey !== 'string') {
  console.error('URL ou chave publicável local não encontrada.');
  process.exit(1);
}

const result = spawnSync(
  'pnpm',
  ['--filter', '@iatron/web', 'test:e2e:auth:direct'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8080/v1',
      SUPABASE_URL: supabaseUrl,
      SUPABASE_PUBLISHABLE_KEY: publishableKey,
      SUPABASE_JWT_ISSUER: `${supabaseUrl}/auth/v1`,
      SUPABASE_JWT_AUDIENCE: 'authenticated',
      SUPABASE_JWT_ALGORITHMS: 'ES256,RS256',
      CORS_ALLOWED_ORIGINS: 'http://127.0.0.1:3000',
      MAILPIT_URL:
        local.MAILPIT_URL ?? local.INBUCKET_URL ?? 'http://127.0.0.1:54324',
    },
  },
);
process.exit(result.status ?? 1);

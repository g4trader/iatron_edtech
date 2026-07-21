import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  assertStagingTarget,
  assertSupabaseUrlMatches,
  requiredEnvironment,
} from './cloud-environment.mjs';

const action = process.argv[2];
const projectRef = assertStagingTarget({ destructive: action === 'seed' });
const root = resolve(import.meta.dirname, '..');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    env: { ...process.env, ...options.env },
  });
  if (result.status !== 0) {
    if (options.capture)
      console.error(result.stderr || 'Comando remoto falhou.');
    process.exit(result.status ?? 1);
  }
  return result.stdout ?? '';
}

function supabase(args, options) {
  requiredEnvironment('SUPABASE_ACCESS_TOKEN');
  return run('pnpm', ['exec', 'supabase', ...args], options);
}

function generatedTypes() {
  const output = supabase(
    [
      'gen',
      'types',
      'typescript',
      '--project-id',
      projectRef,
      '--schema',
      'public',
    ],
    { capture: true },
  );
  if (!output.includes('export type Database')) {
    throw new Error('Saída de tipos inválida; arquivo versionado preservado.');
  }
  return output;
}

switch (action) {
  case 'link':
    supabase(['link', '--project-ref', projectRef]);
    break;
  case 'push':
    supabase(['link', '--project-ref', projectRef]);
    supabase(['db', 'push', '--linked', '--dry-run']);
    supabase(['db', 'push', '--linked']);
    break;
  case 'test':
    supabase(['link', '--project-ref', projectRef]);
    supabase(['test', 'db', '--linked', 'supabase/tests/database']);
    break;
  case 'types-check': {
    const expected = readFileSync(
      join(root, 'packages/database/src/database.types.ts'),
      'utf8',
    );
    if (generatedTypes() !== expected) {
      throw new Error('Drift detectado nos tipos do banco de staging.');
    }
    console.log('Tipos remotos sem drift.');
    break;
  }
  case 'types-update': {
    const target = join(root, 'packages/database/src/database.types.ts');
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'iatron-db-types-'));
    const temporary = join(temporaryDirectory, 'database.types.ts');
    try {
      writeFileSync(temporary, generatedTypes(), { mode: 0o600 });
      renameSync(temporary, target);
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
    console.log('Tipos remotos atualizados atomicamente.');
    break;
  }
  case 'seed': {
    const databaseUrl = requiredEnvironment('SUPABASE_STAGING_DATABASE_URL');
    const url = new URL(databaseUrl);
    if (
      !url.hostname.endsWith('.pooler.supabase.com') &&
      !url.hostname.endsWith('.supabase.co')
    ) {
      throw new Error('Host do banco não pertence ao Supabase.');
    }
    const databaseName = url.pathname.slice(1);
    const seedEnvironment = {
      PGHOST: url.hostname,
      PGPORT: url.port || '5432',
      PGDATABASE: databaseName,
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGSSLMODE: 'require',
      PGOPTIONS: '-c iatron.environment=staging',
    };
    run('psql', ['-v', 'ON_ERROR_STOP=1', '-f', 'supabase/seed.staging.sql'], {
      env: seedEnvironment,
    });
    break;
  }
  case 'smoke': {
    const supabaseUrl = requiredEnvironment('SUPABASE_STAGING_URL');
    assertSupabaseUrlMatches(supabaseUrl, projectRef);
    const response = await fetch(`${supabaseUrl}/auth/v1/health`);
    if (!response.ok)
      throw new Error(`Smoke Supabase falhou (${response.status}).`);
    console.log('Smoke Supabase staging aprovado.');
    break;
  }
  default:
    throw new Error(`Ação de banco desconhecida: ${action ?? '(ausente)'}`);
}

import { spawnSync } from 'node:child_process';
import { renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const result = spawnSync(
  'pnpm',
  [
    'exec',
    'supabase',
    'gen',
    'types',
    'typescript',
    '--local',
    '--schema',
    'public',
  ],
  { encoding: 'utf8', timeout: 60_000 },
);

if (result.status !== 0 || !result.stdout.includes('export type Database')) {
  console.error(
    'Não foi possível gerar tipos; o arquivo atual foi preservado.',
  );
  process.exit(1);
}

const target = resolve('packages/database/src/database.types.ts');
const temporary = `${target}.tmp`;
writeFileSync(temporary, result.stdout, { encoding: 'utf8', mode: 0o600 });
renameSync(temporary, target);
console.log('Tipos do schema public gerados com sucesso.');

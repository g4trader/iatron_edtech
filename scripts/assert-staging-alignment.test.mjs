import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('o gate exige SHA, contrato e migration iguais antes do E2E', () => {
  const source = readFileSync(
    new URL('./assert-staging-alignment.mjs', import.meta.url),
    'utf8',
  );
  for (const invariant of [
    'last.webSha === expectedSha',
    'last.apiSha === expectedSha',
    "last.webContract === 'journey-v1'",
    "last.apiContract === 'journey-v1'",
    'last.migration === expectedMigration',
  ]) {
    assert.match(source, new RegExp(invariant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

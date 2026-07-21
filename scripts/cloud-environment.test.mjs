import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  assertStagingTarget,
  assertSupabaseUrlMatches,
} from './cloud-environment.mjs';

const variableNames = [
  'SUPABASE_STAGING_PROJECT_ID',
  'SUPABASE_APPROVED_STAGING_PROJECT_ID',
  'SUPABASE_PRODUCTION_PROJECT_ID',
  'E2E_ALLOW_DESTRUCTIVE_TESTS',
];
const originalEnvironment = Object.fromEntries(
  variableNames.map((name) => [name, process.env[name]]),
);

afterEach(() => {
  for (const name of variableNames) {
    const value = originalEnvironment[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

function configureApprovedStaging() {
  process.env.SUPABASE_STAGING_PROJECT_ID = 'abcdefghijklmnopqrst';
  process.env.SUPABASE_APPROVED_STAGING_PROJECT_ID = 'abcdefghijklmnopqrst';
}

describe('cloud staging guard', () => {
  it('accepts only the explicitly approved staging ref', () => {
    configureApprovedStaging();
    assert.equal(assertStagingTarget(), 'abcdefghijklmnopqrst');
    process.env.SUPABASE_APPROVED_STAGING_PROJECT_ID = 'bcdefghijklmnopqrstu';
    assert.throws(() => assertStagingTarget(), /explicitamente aprovado/);
  });

  it('refuses a production project ref', () => {
    configureApprovedStaging();
    process.env.SUPABASE_PRODUCTION_PROJECT_ID = 'abcdefghijklmnopqrst';
    assert.throws(() => assertStagingTarget(), /produção/);
  });

  it('requires the destructive test flag', () => {
    configureApprovedStaging();
    assert.throws(
      () => assertStagingTarget({ destructive: true }),
      /E2E_ALLOW_DESTRUCTIVE_TESTS=1/,
    );
    process.env.E2E_ALLOW_DESTRUCTIVE_TESTS = '1';
    assert.equal(
      assertStagingTarget({ destructive: true }),
      'abcdefghijklmnopqrst',
    );
  });

  it('requires an HTTPS URL for the approved project', () => {
    assert.doesNotThrow(() =>
      assertSupabaseUrlMatches(
        'https://abcdefghijklmnopqrst.supabase.co',
        'abcdefghijklmnopqrst',
      ),
    );
    assert.throws(
      () =>
        assertSupabaseUrlMatches(
          'https://bcdefghijklmnopqrstu.supabase.co',
          'abcdefghijklmnopqrst',
        ),
      /não corresponde/,
    );
  });
});

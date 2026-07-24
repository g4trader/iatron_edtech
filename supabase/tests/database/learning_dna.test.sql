begin;
select plan(16);

select has_table('public', 'learning_dna_policies', 'versioned policies exist');
select has_table('public', 'learning_dna_snapshots', 'snapshots exist');
select has_pk('public', 'learning_dna_policies', 'policy has primary key');
select has_pk('public', 'learning_dna_snapshots', 'snapshot has primary key');
select has_column('public', 'learning_dna_snapshots', 'source_hash',
  'snapshot stores reproducibility hash');
select has_column('public', 'learning_dna_snapshots', 'indicators',
  'snapshot stores derived indicators');
select has_column('public', 'learning_dna_snapshots', 'sufficiency',
  'snapshot stores explicit sufficiency');
select has_index('public', 'learning_dna_snapshots',
  'learning_dna_snapshots_student_latest_idx',
  'latest snapshot lookup is indexed');
select has_index('public', 'learning_dna_snapshots',
  'learning_dna_snapshots_student_scope_idx',
  'scoped snapshot lookup is indexed');
select has_trigger('public', 'learning_dna_snapshots',
  'learning_dna_snapshots_immutable',
  'snapshot history cannot be overwritten');
select has_trigger('public', 'question_attempts',
  'question_attempts_capture_learning_dna',
  'new attempts capture an append-only snapshot');
select policies_are(
  'public', 'learning_dna_policies',
  array['learning_dna_policies_read'],
  'authenticated policy metadata is read-only'
);
select policies_are(
  'public', 'learning_dna_snapshots',
  array['learning_dna_snapshots_read_own'],
  'snapshot RLS exposes only the own student'
);
select table_privs_are(
  'public', 'learning_dna_snapshots', 'authenticated',
  array['SELECT'],
  'authenticated cannot mutate snapshots'
);
select table_privs_are(
  'public', 'learning_dna_snapshots', 'anon',
  array[]::text[],
  'anonymous has no snapshot privileges'
);
select is(
  (
    select count(*)::integer
    from public.learning_dna_policies
    where is_active and is_synthetic
      and version = 'learning-dna-policy-v1-synthetic'
  ),
  1,
  'one synthetic versioned policy is active'
);

select * from finish();
rollback;

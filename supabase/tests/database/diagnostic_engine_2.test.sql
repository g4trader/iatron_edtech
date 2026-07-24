begin;
select plan(14);

select has_column('public', 'question_attempts', 'evidence_signal',
  'attempt stores the temporary evidence signal');
select has_column('public', 'question_attempts', 'evidence_algorithm_version',
  'attempt stores the evidence algorithm version');
select col_is_null('public', 'question_attempts', 'stated_confidence',
  'declared safety remains optional for legacy attempts');
select has_column('public', 'diagnostic_assessments', 'policy_version',
  'assessment stores its coverage policy version');
select has_column('public', 'assessment_results', 'completion_reason',
  'result explains why the diagnosis stopped');
select has_column('public', 'assessment_results', 'evidence_sufficient',
  'result explicitly records insufficient evidence');
select has_table('public', 'assessment_result_areas',
  'area reports are persisted');
select has_pk('public', 'assessment_result_areas',
  'area reports have a primary key');
select has_index('public', 'assessment_result_areas',
  'assessment_result_areas_area_idx',
  'area report lookup is indexed');
select is(
  (select confupdtype from pg_constraint
   where conrelid = 'public.assessment_result_areas'::regclass
     and contype = 'f' and confrelid = 'public.specialties'::regclass limit 1),
  'a',
  'area report references the large-area specialty catalog'
);
select policies_are(
  'public', 'assessment_result_areas',
  array['assessment_result_areas_read_own'],
  'area reports only expose the own-student read policy'
);
select function_privs_are(
  'public', 'finish_diagnostic_assessment_v2',
  array['uuid', 'text', 'boolean'],
  'authenticated',
  array['EXECUTE'],
  'authenticated can finish through the v2 domain function'
);
select function_privs_are(
  'public', 'finish_diagnostic_assessment_v2',
  array['uuid', 'text', 'boolean'],
  'anon',
  array[]::text[],
  'anonymous cannot finish an assessment'
);
select col_has_check(
  'public', 'assessment_results', 'completion_reason',
  'completion reason rejects invented precision'
);

select * from finish();
rollback;

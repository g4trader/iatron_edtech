begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(28);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'learning-a@example.test', '', now(), now(), now(), '{}', '{"display_name":"Learning A"}'),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'learning-b@example.test', '', now(), now(), now(), '{}', '{"display_name":"Learning B"}');

select extensions.is((select count(*) from public.learning_event_types), 6::bigint, 'seed defines extensible event types');

select public.record_learning_event(
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'QuestionAnswered',
  '2026-07-20T12:00:00Z',
  '{"competencyOutcomes":[{"competencyId":"54000000-0000-4000-8000-000000000001","isCorrect":true,"weight":1,"difficulty":4,"responseTimeMs":70000},{"competencyId":"54000000-0000-4000-8000-000000000002","isCorrect":false,"weight":0.8,"difficulty":3,"responseTimeMs":70000}]}'::jsonb,
  'learning-test-question-001'
) as event_id \gset

select extensions.is((select count(*) from public.learning_events where student_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'), 1::bigint, 'event store records the interaction');
select extensions.is((select count(*) from public.learning_evidence where source_event_id = :'event_id'), 2::bigint, 'one event derives multiple evidences');
select extensions.is((select count(*) from public.mastery_snapshots where source_event_id = :'event_id'), 2::bigint, 'mastery snapshots follow derived evidence');
select extensions.is((select count(distinct source_event_id) from public.learning_evidence where source_event_id = :'event_id'), 1::bigint, 'evidence retains its source event');
select extensions.results_eq($$select weight, difficulty, response_time_ms, is_correct, algorithm_version from public.learning_evidence where competency_id = '54000000-0000-4000-8000-000000000001' and student_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'$$, $$values (1.0000::numeric, 4::smallint, 70000, true, 'evidence-v1'::text)$$, 'evidence is fully explainable');
select extensions.is((select evidence_count from public.current_mastery where student_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd' and competency_id = '54000000-0000-4000-8000-000000000001'), 1, 'mastery reports evidence count');
select extensions.ok((select mastery between 0 and 1 and confidence between 0 and 1 from public.current_mastery where student_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd' limit 1), 'mastery and confidence are normalized');

select extensions.is(
  public.record_learning_event('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'QuestionAnswered', '2026-07-20T12:00:00Z', '{"competencyOutcomes":[]}'::jsonb, 'learning-test-question-001'),
  :'event_id'::uuid,
  'idempotent retry returns the original event'
);
select extensions.is((select count(*) from public.learning_events where student_id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'), 1::bigint, 'idempotent retry does not duplicate events');
select extensions.is((select count(*) from public.learning_evidence where source_event_id = :'event_id'), 2::bigint, 'idempotent retry does not duplicate evidence');

select public.record_learning_event(
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'AssessmentFinished',
  '2026-07-21T12:00:00Z',
  '{"answered":10,"correct":7}'::jsonb,
  'learning-test-assessment-001'
) as assessment_event_id \gset
select extensions.is((select count(*) from public.learning_events where id = :'assessment_event_id'), 1::bigint, 'non-question learning event is persisted');
select extensions.is((select count(*) from public.learning_evidence where source_event_id = :'assessment_event_id'), 0::bigint, 'event without competency outcome creates no evidence');

select extensions.throws_ok($$select public.record_learning_event('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'QuestionAnswered', now(), '{}'::jsonb, 'learning-test-invalid-001')$$, '22023', null, 'invalid question event is rejected');
select extensions.is((select count(*) from public.learning_events where idempotency_key = 'learning-test-invalid-001'), 0::bigint, 'rejected event leaves no partial history');
select extensions.throws_ok(format('update public.learning_events set occurred_at = now() where id = %L', :'event_id'), '55000', null, 'events cannot be overwritten');
select extensions.throws_ok(format('delete from public.learning_evidence where source_event_id = %L', :'event_id'), '55000', null, 'evidence cannot be deleted');
select extensions.throws_ok($$insert into public.learning_evidence (student_id, competency_id, source_event_id, weight, difficulty, is_correct, observed_at, algorithm_version) values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '54000000-0000-4000-8000-000000000003', (select id from public.learning_events where idempotency_key = 'learning-test-question-001'), 0, 3, true, now(), 'evidence-v1')$$, '23514', null, 'evidence weight constraint is enforced');

set local role authenticated;
set local request.jwt.claims = '{"sub":"dddddddd-dddd-4ddd-8ddd-dddddddddddd","role":"authenticated"}';
select extensions.is((select count(*) from public.learning_events), 2::bigint, 'student reads own event timeline');
select extensions.is((select count(*) from public.learning_evidence), 2::bigint, 'student reads own evidence');
select extensions.is((select count(*) from public.current_mastery), 2::bigint, 'student reads current mastery derived from own snapshots');
select extensions.throws_ok($$insert into public.learning_events (student_id, event_type, occurred_at, idempotency_key) values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'ReviewCompleted', now(), 'forbidden-write')$$, '42501', null, 'browser cannot append learning events directly');
select extensions.throws_ok($$update public.mastery_snapshots set mastery = 1$$, '42501', null, 'browser cannot write mastery directly');

set local request.jwt.claims = '{"sub":"eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee","role":"authenticated"}';
select extensions.is((select count(*) from public.learning_events), 0::bigint, 'another student cannot read the timeline');
select extensions.is((select count(*) from public.learning_evidence), 0::bigint, 'another student cannot read evidence');

set local role anon;
set local request.jwt.claims = '{}';
select extensions.throws_ok($$select * from public.learning_events$$, '42501', null, 'anonymous users cannot read learning history');

set local role postgres;
select public.record_learning_event('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'ReviewCompleted', now(), '{}'::jsonb, 'learning-test-account-delete');
delete from public.profiles where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
select extensions.is((select count(*) from public.profiles where id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'), 0::bigint, 'account profile can be deleted');
select extensions.is((select count(*) from public.learning_events where student_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'), 0::bigint, 'account deletion cascades through append-only history');

select * from extensions.finish();
rollback;

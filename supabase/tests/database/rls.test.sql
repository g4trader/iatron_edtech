begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(45);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@example.test', '', now(), now(), now(), '{}', '{"display_name":"Estudante A"}'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@example.test', '', now(), now(), now(), '{}', '{"display_name":"Estudante B"}');

select extensions.is((select count(*) from public.profiles where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')), 2::bigint, 'trigger creates both profiles');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fallback@example.test', '', now(), now(), now(), '{}', '{}');
select extensions.is((select display_name from public.profiles where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'), 'fallback', 'trigger derives a safe fallback name');
select extensions.throws_ok($$insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at) values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'duplicate@example.test', now(), now())$$, '23505', null, 'duplicate auth identity is refused');
select extensions.throws_ok($$insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at) values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', null, now(), now())$$, '23502', null, 'profile trigger failure rolls back auth user creation');
select extensions.is((select count(*) from auth.users where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'), 0::bigint, 'failed trigger leaves no partial auth user');
delete from auth.users where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
select extensions.is((select count(*) from public.profiles where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'), 0::bigint, 'deleting auth user cascades to profile');

set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';
select extensions.is((select count(*) from public.profiles), 1::bigint, 'student A sees only own profile');
select extensions.lives_ok($$update public.profiles set display_name = 'Nome Atualizado' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$, 'student updates own profile');
select extensions.is((select display_name from public.profiles), 'Nome Atualizado', 'own update persists');
select extensions.throws_ok($$update public.profiles set onboarding_status = 'completed' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$, '42501', null, 'student cannot bypass onboarding state transition');
select extensions.throws_ok($$update public.profiles set email = 'spoof@example.test' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$, '42501', null, 'student cannot alter managed email');
select extensions.lives_ok($$update public.profiles set display_name = 'Nome Final' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$, 'updated_at trigger executes without a direct timestamp grant');
select extensions.ok((select updated_at > '2000-01-02'::timestamptz from public.profiles), 'updated_at is refreshed automatically');
select extensions.lives_ok($$update public.student_profiles set residency_year = 2, graduation_year = 2026 where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$, 'student updates own academic profile');
select extensions.results_eq($$select residency_year, graduation_year from public.student_profiles$$, $$values (2::smallint, 2026::smallint)$$, 'own academic values persist');
select extensions.throws_ok($$insert into public.student_profiles (user_id, residency_year) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 3)$$, '42501', null, 'student cannot create academic data for another user');
select extensions.is((select count(*) from public.institutions), 3::bigint, 'authenticated student sees active institutions');
select extensions.is((select count(*) from public.exam_editions), 3::bigint, 'inactive edition is hidden');
select extensions.throws_ok($$insert into public.institutions (name, acronym, state_code) values ('Invasora', 'INV', 'SP')$$, '42501', null, 'student cannot create catalogue records');
select extensions.throws_ok($$insert into public.student_availability (user_id, weekday, minutes_available) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 1, 60)$$, '42501', null, 'student cannot spoof another user id');
select extensions.lives_ok($$insert into public.student_availability (user_id, weekday, minutes_available) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 60)$$, 'student inserts own availability');
select extensions.throws_ok($$insert into public.student_availability (user_id, weekday, minutes_available) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 30)$$, '23505', null, 'duplicate weekday is refused');
select extensions.lives_ok($$insert into public.student_target_exams (user_id, exam_edition_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '40000000-0000-4000-8000-000000000001')$$, 'student selects own valid target');
select extensions.throws_ok($$insert into public.student_target_exams (user_id, exam_edition_id) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '40000000-0000-4000-8000-000000000001')$$, '23505', null, 'duplicate target is refused');
select extensions.throws_ok($$insert into public.student_target_exams (user_id, exam_edition_id) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '40000000-0000-4000-8000-000000000001')$$, '42501', null, 'student cannot select target for another user');
select extensions.throws_ok($$update public.exam_boards set name = 'Alterada'$$, '42501', null, 'student cannot update exam boards');
select extensions.throws_ok($$update public.exam_programs set name = 'Alterado'$$, '42501', null, 'student cannot update exam programs');
select extensions.throws_ok($$update public.exam_editions set year = 2099$$, '42501', null, 'student cannot update exam editions');
select extensions.lives_ok($$select public.save_onboarding(p_step => 4::smallint, p_display_name => 'Estudante A Completa', p_experience_level => 'recent_graduate', p_preferred_session_minutes => 45::smallint, p_assessment_preference => 'mixed', p_availability => '[{"weekday":1,"minutesAvailable":90}]'::jsonb, p_exam_edition_ids => array['40000000-0000-4000-8000-000000000001']::uuid[], p_complete => true)$$, 'atomic onboarding completes');
select extensions.lives_ok($$select public.save_onboarding(p_step => 4::smallint, p_display_name => 'Estudante A Completa', p_experience_level => 'recent_graduate', p_preferred_session_minutes => 45::smallint, p_assessment_preference => 'mixed', p_availability => '[{"weekday":1,"minutesAvailable":90}]'::jsonb, p_exam_edition_ids => array['40000000-0000-4000-8000-000000000001']::uuid[], p_complete => true)$$, 'onboarding completion retry is idempotent');
select extensions.is((select count(*) from public.student_availability), 1::bigint, 'onboarding retry does not duplicate availability');
select extensions.is((select count(*) from public.student_target_exams), 1::bigint, 'onboarding retry does not duplicate targets');
select extensions.results_eq($$select experience_level, preferred_session_minutes, assessment_preference from public.student_profiles$$, $$values ('recent_graduate'::text, 45::smallint, 'mixed'::text)$$, 'structured onboarding preferences persist');
select extensions.results_eq($$select onboarding_status::text, onboarding_step from public.profiles$$, $$values ('completed'::text, 4::smallint)$$, 'onboarding final state is consistent');
select extensions.throws_ok($$select public.save_onboarding(p_step => 2::smallint, p_availability => '[{"weekday":2,"minutesAvailable":30},{"weekday":2,"minutesAvailable":60}]'::jsonb)$$, '23505', null, 'duplicate availability in atomic write rolls back');
select extensions.is((select minutes_available from public.student_availability where weekday = 1), 90::smallint, 'failed onboarding write preserves previous availability');

set local request.jwt.claims = '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}';
select extensions.is((select count(*) from public.student_availability), 0::bigint, 'student B cannot see student A availability');
select extensions.is((select count(*) from public.profiles), 1::bigint, 'student B sees only own profile');
select extensions.is((select count(*) from public.student_profiles where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), 0::bigint, 'student B cannot see student A academic profile');
select extensions.is((select count(*) from public.student_target_exams), 0::bigint, 'student B cannot see student A targets');
select extensions.lives_ok($$update public.student_availability set minutes_available = 5 where user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$, 'cross-user update cannot modify hidden rows');

set local request.jwt.claims = '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';
select extensions.is((select minutes_available from public.student_availability where weekday = 1), 90::smallint, 'student B did not alter student A availability');

set local role anon;
set local request.jwt.claims = '{}';
select extensions.throws_ok($$select * from public.profiles$$, '42501', null, 'anonymous cannot read profiles');
select extensions.throws_ok($$select * from public.institutions$$, '42501', null, 'anonymous cannot read catalogue');

set local role service_role;
select extensions.is((select count(*) from public.profiles where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')), 2::bigint, 'service role can perform intended administration');

select * from extensions.finish();
rollback;

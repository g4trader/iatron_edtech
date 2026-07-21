begin;
select plan(14);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@example.test', '', now(), now(), now(), '{}', '{"display_name":"Estudante A"}'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@example.test', '', now(), now(), now(), '{}', '{"display_name":"Estudante B"}');

select is((select count(*) from public.profiles where id in ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')), 2::bigint, 'trigger creates both profiles');

set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';
select is((select count(*) from public.profiles), 1::bigint, 'student A sees only own profile');
select lives_ok($$update public.profiles set display_name = 'Nome Atualizado' where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$$, 'student updates own profile');
select is((select display_name from public.profiles), 'Nome Atualizado', 'own update persists');
select is((select count(*) from public.institutions), 3::bigint, 'authenticated student sees active institutions');
select is((select count(*) from public.exam_editions), 3::bigint, 'inactive edition is hidden');
select throws_ok($$insert into public.institutions (name, acronym, state_code) values ('Invasora', 'INV', 'SP')$$, '42501', null, 'student cannot create catalogue records');
select throws_ok($$insert into public.student_availability (user_id, weekday, minutes_available) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 1, 60)$$, '42501', null, 'student cannot spoof another user id');
select lives_ok($$insert into public.student_availability (user_id, weekday, minutes_available) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 60)$$, 'student inserts own availability');

set local request.jwt.claims = '{"sub":"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb","role":"authenticated"}';
select is((select count(*) from public.student_availability), 0::bigint, 'student B cannot see student A availability');
select is((select count(*) from public.profiles), 1::bigint, 'student B sees only own profile');

set local role anon;
set local request.jwt.claims = '{}';
select throws_ok($$select * from public.profiles$$, '42501', null, 'anonymous cannot read profiles');
select throws_ok($$select * from public.institutions$$, '42501', null, 'anonymous cannot read catalogue');

set local role service_role;
select is((select count(*) from public.profiles), 2::bigint, 'service role can perform intended administration');

select * from finish();
rollback;

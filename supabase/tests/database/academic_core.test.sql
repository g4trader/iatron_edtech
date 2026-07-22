begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(20);

select extensions.is((select count(*) from public.specialties), 3::bigint, 'seed contains specialties');
select extensions.is((select count(*) from public.medical_areas), 3::bigint, 'seed contains reusable areas');
select extensions.is((select count(*) from public.themes), 3::bigint, 'seed contains themes');
select extensions.is((select count(*) from public.subthemes), 3::bigint, 'seed contains subthemes');
select extensions.is((select count(*) from public.competencies), 5::bigint, 'seed contains measurable competencies');
select extensions.is((select count(distinct specialty_id) from public.specialty_areas where area_id = '51000000-0000-4000-8000-000000000003'), 3::bigint, 'an area belongs to many specialties');
select extensions.is((select count(*) from public.program_specialties where exam_program_id = '30000000-0000-4000-8000-000000000001'), 2::bigint, 'a program includes many specialties');
select extensions.is((select count(*) from public.exam_questions where question_id = '58000000-0000-4000-8000-000000000001'), 2::bigint, 'one question is reused in many exams');
select extensions.is((select count(*) from public.guideline_competencies where guideline_id = '57000000-0000-4000-8000-000000000001'), 2::bigint, 'guideline links to competencies');
select extensions.is((select count(*) from public.guideline_specialties where guideline_id = '57000000-0000-4000-8000-000000000002'), 2::bigint, 'guideline links to specialties');

select extensions.throws_ok($$insert into public.competencies (subtheme_id, code, name, description) values ('53000000-0000-4000-8000-000000000001', 'CARD.SCA.001', 'Duplicada', 'Inválida')$$, '23505', null, 'competency code is globally unique');
select extensions.throws_ok($$insert into public.question_versions (question_id, version, stem) values ('58000000-0000-4000-8000-000000000001', 1, 'Duplicada')$$, '23505', null, 'question version cannot be duplicated');
select extensions.throws_ok($$insert into public.questions (canonical_hash) values ('invalid')$$, '23514', null, 'canonical hash format is enforced');
select extensions.throws_ok($$insert into public.question_options (question_version_id, label, content, is_correct, position) values ('59000000-0000-4000-8000-000000000001', 'C', 'Outra correta', true, 3)$$, '23505', null, 'a version has at most one correct option');
select extensions.throws_ok($$insert into public.exam_questions (exam_edition_id, question_id, question_version_id, position) values ('40000000-0000-4000-8000-000000000003', '58000000-0000-4000-8000-000000000001', '59000000-0000-4000-8000-000000000002', 2)$$, '23503', null, 'exam cannot pin a version from another question');

set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';
select extensions.is((select count(*) from public.competencies), 5::bigint, 'authenticated students read competencies');
select extensions.is((select count(*) from public.guidelines), 2::bigint, 'authenticated students read guidelines');
select extensions.is((select count(*) from public.questions), 2::bigint, 'authenticated students read published seed questions');
select extensions.throws_ok($$insert into public.medical_areas (code, name) values ('INVALID', 'Área invasora')$$, '42501', null, 'authenticated students cannot mutate catalog');

set local role anon;
set local request.jwt.claims = '{}';
select extensions.throws_ok($$select * from public.competencies$$, '42501', null, 'anonymous users cannot read academic catalog');

select * from extensions.finish();
rollback;

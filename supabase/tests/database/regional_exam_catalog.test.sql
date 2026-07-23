begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(10);

insert into public.institutions (id,name,acronym,state_code) values
  ('65000000-0000-4000-8000-000000000001','Instituição Regional A','IRA','RS'),
  ('65000000-0000-4000-8000-000000000002','Instituição Regional B','IRB','SC');
insert into public.exam_boards (id,name,acronym)
values ('65000000-0000-4000-8000-000000000003','Organizadora Regional','ORG-S');
insert into public.exam_programs (id,institution_id,exam_board_id,code,name,scope,region_code,state_code,city)
values ('65000000-0000-4000-8000-000000000004','65000000-0000-4000-8000-000000000001','65000000-0000-4000-8000-000000000003','REGIONAL_TEST','Processo Regional Teste','unified','S','RS','Porto Alegre');
insert into public.exam_program_institutions (exam_program_id,institution_id,participation_role) values
  ('65000000-0000-4000-8000-000000000004','65000000-0000-4000-8000-000000000001','host'),
  ('65000000-0000-4000-8000-000000000004','65000000-0000-4000-8000-000000000002','participant');
insert into public.exam_editions (id,exam_program_id,year,edition,exam_board_id,status,source_url,verified_at,verification_status,unconfirmed_fields)
values ('65000000-0000-4000-8000-000000000005','65000000-0000-4000-8000-000000000004',2027,'Ingresso 2027','65000000-0000-4000-8000-000000000003','announced','https://example.test/official',current_date,'partial','{application_date}');

select extensions.is((select count(*) from public.exam_programs where region_code='S' and state_code='RS' and id='65000000-0000-4000-8000-000000000004'),1::bigint,'structured region and state filters work');
select extensions.is((select count(*) from public.exam_program_institutions where exam_program_id='65000000-0000-4000-8000-000000000004'),2::bigint,'one process relates to many institutions');
select extensions.is((select count(distinct institution_id) from public.exam_program_institutions where exam_program_id='65000000-0000-4000-8000-000000000004'),2::bigint,'participating institutions are not duplicated');
select extensions.is((select source_url from public.exam_editions where id='65000000-0000-4000-8000-000000000005'),'https://example.test/official','edition preserves its primary source');
select extensions.is((select unconfirmed_fields[1] from public.exam_editions where id='65000000-0000-4000-8000-000000000005'),'application_date','unknown fields remain explicit');
select extensions.throws_ok($$insert into public.exam_programs(institution_id,code,name,region_code) values('65000000-0000-4000-8000-000000000001','REGIONAL_TEST','Duplicado','S')$$,'23505',null,'process code prevents duplicates');
select extensions.throws_ok($$insert into public.exam_editions(exam_program_id,year,verification_status) values('65000000-0000-4000-8000-000000000004',2028,'invented')$$,'23514',null,'verification status is constrained');

set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';
select extensions.is((select count(*) from public.exam_program_institutions where exam_program_id='65000000-0000-4000-8000-000000000004'),2::bigint,'authenticated students read participating institutions');
select extensions.throws_ok($$insert into public.exam_program_institutions(exam_program_id,institution_id) values('65000000-0000-4000-8000-000000000004','65000000-0000-4000-8000-000000000001')$$,'42501',null,'authenticated students cannot mutate process relationships');
select extensions.throws_ok($$update public.exam_editions set source_url='https://malicious.example' where id='65000000-0000-4000-8000-000000000005'$$,'42501',null,'authenticated students cannot alter provenance');

select * from extensions.finish();
rollback;

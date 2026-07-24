begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(23);

select extensions.is(
  (select count(*) from public.exam_intelligence_profiles where exam_program_id='63000000-0000-4000-8000-000000000001'),
  2::bigint,
  'AMRIGS has two demonstrative profile versions'
);
select extensions.is(
  (select count(*) from public.exam_intelligence_profiles where exam_program_id='63000000-0000-4000-8000-000000000001' and is_active),
  1::bigint,
  'only one AMRIGS profile version is active'
);
select extensions.is(
  (select version from public.exam_intelligence_profiles where is_active and exam_program_id='63000000-0000-4000-8000-000000000001'),
  1,
  'the expected profile version is active'
);
select extensions.ok(
  (select bool_and(is_synthetic and editorial_status='draft' and confidence='insufficient') from public.exam_intelligence_profiles),
  'all seeded profiles are explicitly synthetic drafts with insufficient confidence'
);
select extensions.is(
  (select count(*) from public.exam_blueprints where profile_id='65000000-0000-4000-8000-000000000001' and is_active),
  1::bigint,
  'the active profile has one active blueprint'
);
select extensions.is(
  (select count(*) from public.exam_blueprint_areas where blueprint_id='66000000-0000-4000-8000-000000000001'),
  5::bigint,
  'the blueprint contains five large areas'
);
select extensions.is(
  (select sum(expected_proportion) from public.exam_blueprint_areas where blueprint_id='66000000-0000-4000-8000-000000000001'),
  1.0000::numeric,
  'synthetic area proportions form a complete distribution'
);
select extensions.is(
  (select count(*) from public.exam_recurrence_statistics where profile_id='65000000-0000-4000-8000-000000000001'),
  4::bigint,
  'statistics cover area, theme, subtheme and competency examples'
);
select extensions.ok(
  (select bool_and(is_synthetic and editorial_status='draft' and relevance='insufficient' and confidence='insufficient') from public.exam_recurrence_statistics),
  'synthetic statistics cannot claim relevance or confidence'
);

select extensions.throws_ok(
  $$insert into public.exam_intelligence_profiles (
    exam_program_id,display_name,version,valid_from,editorial_status,is_active,
    confidence,source_title,source_origin,responsible_editorial,method_version,
    is_synthetic,last_updated_at
  ) values (
    '63000000-0000-4000-8000-000000000001','Versão duplicada',1,current_date,
    'draft',false,'insufficient','Teste','synthetic_fixture','Teste','v1',true,now()
  )$$,
  '23505',null,'profile version is unique per exam program'
);
select extensions.throws_ok(
  $$insert into public.exam_intelligence_profiles (
    exam_program_id,display_name,version,valid_from,editorial_status,is_active,
    confidence,source_title,source_origin,responsible_editorial,method_version,
    is_synthetic,last_updated_at
  ) values (
    '63000000-0000-4000-8000-000000000001','Outra versão ativa',3,current_date,
    'draft',true,'insufficient','Teste','synthetic_fixture','Teste','v1',true,now()
  )$$,
  '23505',null,'partial index prevents two active profiles'
);
select extensions.throws_ok(
  $$insert into public.exam_blueprints (
    profile_id,version,format_description,correction_rules,source_title,
    confidence,editorial_status,is_synthetic
  ) values (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',1,'Teste','Teste','Teste',
    'insufficient','draft',true
  )$$,
  '23503',null,'blueprint requires an existing profile'
);
select extensions.throws_ok(
  $$insert into public.exam_recurrence_statistics (
    profile_id,version,dimension_type,area_id,theme_id,sample_size,sample_unit,
    occurrences,denominator,coverage,relevance,confidence,origin,method_version,
    editorial_status,is_synthetic,last_updated_at
  ) values (
    '65000000-0000-4000-8000-000000000001',2,'area',
    '51000000-0000-4000-8000-000000000001',
    '52000000-0000-4000-8000-000000000001',0,'questões',0,0,0,'insufficient',
    'insufficient','test','v1','draft',true,now()
  )$$,
  '23514',null,'a statistic references exactly one dimension'
);
select extensions.throws_ok(
  $$insert into public.exam_intelligence_profiles (
    exam_program_id,display_name,version,valid_from,editorial_status,is_active,
    confidence,source_title,source_origin,responsible_editorial,method_version,
    is_synthetic,last_updated_at
  ) values (
    '63000000-0000-4000-8000-000000000001','Status inválido',4,current_date,
    'invented',false,'insufficient','Teste','synthetic_fixture','Teste','v1',false,now()
  )$$,
  '23514',null,'editorial status is constrained'
);
select extensions.throws_ok(
  $$insert into public.exam_intelligence_profiles (
    exam_program_id,display_name,version,valid_from,editorial_status,is_active,
    exams_analyzed,questions_analyzed,confidence,source_title,source_origin,
    responsible_editorial,method_version,is_synthetic,last_updated_at
  ) values (
    '63000000-0000-4000-8000-000000000001','Falsa confiança',5,current_date,
    'draft',false,2,100,'high','Teste','synthetic_fixture','Teste','v1',true,now()
  )$$,
  '23514',null,'synthetic profiles cannot claim analyzed samples or confidence'
);

select extensions.has_index('public','exam_intelligence_profiles','exam_intelligence_profiles_one_active_idx','active profile lookup is indexed');
select extensions.has_index('public','exam_intelligence_profiles','exam_intelligence_profiles_program_version_idx','profile version lookup is indexed');
select extensions.has_index('public','exam_blueprints','exam_blueprints_profile_version_idx','blueprint lookup is indexed');
select extensions.has_index('public','exam_recurrence_statistics','exam_recurrence_statistics_profile_dimension_idx','dimension lookup is indexed');

set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';
select extensions.is((select count(*) from public.exam_intelligence_profiles),2::bigint,'authenticated students can read profile metadata');
select extensions.is((select count(*) from public.exam_blueprint_areas),5::bigint,'authenticated students can read blueprint distribution');
select extensions.throws_ok(
  $$delete from public.exam_intelligence_profiles where id='65000000-0000-4000-8000-000000000001'$$,
  '42501',null,'authenticated students cannot mutate profiles'
);

set local role anon;
set local request.jwt.claims = '{}';
select extensions.throws_ok(
  $$select * from public.exam_intelligence_profiles$$,
  '42501',null,'anonymous users cannot read exam intelligence'
);

select * from extensions.finish();
rollback;

begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(16);
insert into auth.users(id,email) values
 ('88000000-0000-4000-8000-000000000001','curriculum-student@example.test'),
 ('88000000-0000-4000-8000-000000000002','curriculum-admin@example.test');
insert into public.user_roles(user_id,role) values('88000000-0000-4000-8000-000000000002','admin');
select extensions.is((select count(*) from public.competencies where code like 'V5.%'),309::bigint,'309 specified proposals, not the inconsistent claimed total');
select extensions.is((select count(*) from public.competencies where code like 'V5.%' and is_active),0::bigint,'proposals cannot influence existing diagnoses');
select extensions.is((select count(*) from public.competencies where id in ('54000000-0000-4000-8000-000000000001','54000000-0000-4000-8000-000000000002','54000000-0000-4000-8000-000000000003','54000000-0000-4000-8000-000000000004','54000000-0000-4000-8000-000000000005')),5::bigint,'existing identities preserved');
select extensions.is((select count(*) from public.competencies c where code like 'V5.%' and not exists(select 1 from public.competency_objectives o where o.competency_id=c.id)),0::bigint,'every proposal has measurable objectives');
select extensions.is((select count(*) from public.curriculum_catalog_rows where code like 'V5.%' and contents+questions+verified_references>0),0::bigint,'no invented coverage');
set local role authenticated;
set local request.jwt.claim.sub='88000000-0000-4000-8000-000000000001';
select extensions.throws_ok($$select public.admin_curriculum_catalog('{}')$$,'42501','Forbidden','student cannot read administrative catalog');
select extensions.throws_ok($$select public.admin_save_curriculum('54000000-0000-4000-8000-000000000001','{}')$$,'42501','Forbidden','student cannot edit curriculum');
set local request.jwt.claim.sub='88000000-0000-4000-8000-000000000002';
select extensions.is(jsonb_array_length(public.admin_curriculum_catalog('{}')->'items'),25,'catalog is paginated');
select extensions.is((public.admin_curriculum_catalog('{"search":"V5.PED."}')->>'total')::integer,115,'search by code and honest pediatric count');
select extensions.is((public.admin_curriculum_catalog('{"specialtyId":"50000000-0000-4000-8000-000000000004"}')->>'total')::integer,0,'GO remains explicitly incomplete');
select extensions.throws_ok($$select public.admin_save_curriculum('54000000-0000-4000-8000-000000000001','{}')$$,'22023','Active competencies require a separate clinical revision','active identities protected from silent clinical edits');
select extensions.lives_ok($$select public.admin_save_curriculum((select id from public.competencies where code='V5.PED.01.01'),'{"name":"Avaliar o recém-nascido em cenário educacional","description":"Proposta de avaliação neonatal aguardando revisão médica.","objectives":["Identificar dados relevantes de uma vinheta neonatal."],"terms":["avaliação neonatal"],"status":"draft","revision":1,"reason":"Refinamento pedagógico em teste transacional","requestId":"curriculum-test"}')$$,'admin persists proposal');
select extensions.is((select curriculum_revision from public.competencies where code='V5.PED.01.01'),2,'revision incremented');
select extensions.ok(exists(select 1 from public.editorial_audit_events where action='curriculum_draft_updated' and metadata->'before'->>'curriculum_revision'='1'),'audited previous version');
select extensions.throws_ok($$select public.admin_save_curriculum((select id from public.competencies where code='V5.PED.01.01'),'{"revision":1}')$$,'40001','Revision conflict','stale write rejected');
select extensions.throws_ok($$select public.start_diagnostic_assessment_v3('Teste curricular',null,null,30::smallint,10::smallint,array[(select id from public.competencies where code='V5.PED.01.01')],'quick_screening')$$,'22023','Inactive competency cannot be assessed','direct assessment RPC cannot target proposed competencies');
select * from extensions.finish();
rollback;

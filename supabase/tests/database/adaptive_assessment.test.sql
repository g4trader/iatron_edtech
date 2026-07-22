begin;
set local role postgres;
set local search_path=public,extensions;
select extensions.plan(23);
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data) values
('abababab-abab-4aba-8aba-abababababab','00000000-0000-0000-0000-000000000000','authenticated','authenticated','assessment-a@example.test','',now(),now(),now(),'{}','{"display_name":"Assessment A"}'),
('cdcdcdcd-cdcd-4cdc-8cdc-cdcdcdcdcdcd','00000000-0000-0000-0000-000000000000','authenticated','authenticated','assessment-b@example.test','',now(),now(),now(),'{}','{"display_name":"Assessment B"}');

set local role authenticated;
set local request.jwt.claims='{"sub":"abababab-abab-4aba-8aba-abababababab","role":"authenticated"}';
select public.start_diagnostic_assessment('Diagnóstico inicial',null,null,30::smallint,2::smallint,array['54000000-0000-4000-8000-000000000001'::uuid,'54000000-0000-4000-8000-000000000002'::uuid]) as assessment_id \gset
select extensions.is((select status from public.diagnostic_assessments where id=:'assessment_id'),'active','assessment starts active');
select extensions.is((select count(*) from public.assessment_competencies where assessment_id=:'assessment_id'),2::bigint,'target competencies are persisted');
select extensions.throws_ok($$insert into public.diagnostic_assessments(student_id,objective,duration_minutes,question_count) values(auth.uid(),'Bypass',30,2)$$,'42501',null,'browser cannot bypass start function');

select public.select_assessment_question(:'assessment_id'::uuid,'59000000-0000-4000-8000-000000000001'::uuid,1::smallint,'{"score":0.9,"reason":"unmeasured"}'::jsonb) as selection_id \gset
select extensions.is((select selection_order from public.assessment_question_selections where id=:'selection_id'),1::smallint,'selection rationale is persisted');
select public.answer_diagnostic_question(:'assessment_id'::uuid,'59000000-0000-4000-8000-000000000001'::uuid,'5a000000-0000-4000-8000-000000000001'::uuid,45000,'high') as attempt_id \gset
select extensions.ok((select is_correct from public.question_attempts where id=:'attempt_id'),'correctness is calculated server-side');
select extensions.is((select response_time_ms from public.question_attempts where id=:'attempt_id'),45000,'response time is persisted');
select extensions.is((select stated_confidence from public.question_attempts where id=:'attempt_id'),'high','stated confidence is persisted');
select extensions.is((select count(*) from public.learning_events where id=(select learning_event_id from public.question_attempts where id=:'attempt_id')),1::bigint,'attempt creates QuestionAnswered event');
select extensions.is((select count(*) from public.learning_evidence where source_event_id=(select learning_event_id from public.question_attempts where id=:'attempt_id')),2::bigint,'attempt automatically creates competency evidence');
select extensions.is((select count(*) from public.current_mastery where student_id=auth.uid()),2::bigint,'attempt automatically recalculates mastery');
select extensions.throws_ok(format('update public.question_attempts set response_time_ms=1 where id=%L',:'attempt_id'),'42501',null,'browser cannot mutate attempts');
select extensions.throws_ok(format('select public.answer_diagnostic_question(%L,%L,%L,1000,%L)',:'assessment_id','59000000-0000-4000-8000-000000000001','5a000000-0000-4000-8000-000000000002','low'),'23505',null,'a question cannot be answered twice');

select public.finish_diagnostic_assessment(:'assessment_id'::uuid) as result_id \gset
select extensions.is((select status from public.diagnostic_assessments where id=:'assessment_id'),'completed','assessment finishes');
select extensions.is((select answered_count from public.assessment_results where id=:'result_id'),1::smallint,'result persists answered count');
select extensions.is((select correct_count from public.assessment_results where id=:'result_id'),1::smallint,'result persists correct count');
select extensions.ok((select overall_confidence between 0 and 1 and diagnostic_coverage=1 from public.assessment_results where id=:'result_id'),'confidence and competency coverage are persisted');
select extensions.is((select count(*) from public.assessment_result_competencies where assessment_result_id=:'result_id'),2::bigint,'result snapshots each target competency');
select extensions.is((select count(*) from public.learning_events where student_id=auth.uid() and event_type='AssessmentFinished'),1::bigint,'finish appends timeline event');
select extensions.throws_ok(format('delete from public.assessment_results where id=%L',:'result_id'),'42501',null,'browser cannot mutate diagnostic results');

set local request.jwt.claims='{"sub":"cdcdcdcd-cdcd-4cdc-8cdc-cdcdcdcdcdcd","role":"authenticated"}';
select extensions.is((select count(*) from public.diagnostic_assessments),0::bigint,'RLS isolates assessments');
select extensions.is((select count(*) from public.question_attempts),0::bigint,'RLS isolates attempts');
select extensions.is((select count(*) from public.assessment_results),0::bigint,'RLS isolates results');
set local role anon;set local request.jwt.claims='{}';
select extensions.throws_ok($$select public.start_diagnostic_assessment('Unauthorized',null,null,30::smallint,2::smallint,array['54000000-0000-4000-8000-000000000001'::uuid])$$,'42501',null,'anonymous cannot start assessment');
select * from extensions.finish();
rollback;

begin;
set local role postgres;
set local search_path=public,extensions;
select extensions.plan(25);
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data) values
('81818181-8181-4181-8181-818181818181','00000000-0000-0000-0000-000000000000','authenticated','authenticated','plan-a@example.test','',now(),now(),now(),'{}','{"display_name":"Plan A"}'),
('82828282-8282-4282-8282-828282828282','00000000-0000-0000-0000-000000000000','authenticated','authenticated','plan-b@example.test','',now(),now(),now(),'{}','{"display_name":"Plan B"}');
update public.student_profiles
set preferred_session_minutes=30, weekly_study_hours=2
where user_id='81818181-8181-4181-8181-818181818181';
insert into public.student_availability(user_id,weekday,minutes_available) values('81818181-8181-4181-8181-818181818181',4,30);
set local role authenticated;
set local request.jwt.claims='{"sub":"81818181-8181-4181-8181-818181818181","role":"authenticated"}';

select public.persist_study_plan(
  'Plano de sete dias',null,'2026-07-23','2026-07-29',30,
  '[{"date":"2026-07-23","weekday":4,"minutesAvailable":30}]',
  '{"mastery":[],"gaps":[],"executionRevision":""}',
  repeat('a',64),'manual',
  '[{"competencyId":"54000000-0000-4000-8000-000000000001","itemType":"gap_reinforcement","priority":0.9,"estimatedMinutes":30,"plannedDate":"2026-07-23","position":1,"status":"planned","origin":"learning-gap-engine","justification":{"reasons":[{"code":"critical","contribution":0.5,"detail":"Gap crítico"}]},"sourceSnapshot":{"mastery":0.2},"replanCount":0},{"competencyId":"54000000-0000-4000-8000-000000000002","itemType":"complementary_diagnosis","priority":0.8,"estimatedMinutes":30,"plannedDate":null,"position":null,"status":"unallocated","origin":"learning-gap-engine","justification":{"reasons":[{"code":"unmeasured","contribution":0.5,"detail":"Sem evidência"}],"unallocatedReason":"insufficient_availability"},"sourceSnapshot":{"mastery":0},"replanCount":0}]'
) as version_id \gset
select extensions.is((select current_version from public.study_plans),1,'first version becomes current');
select extensions.is((select total_planned_minutes from public.study_plan_versions where id=:'version_id'),30,'planned load is persisted');
select extensions.is((select total_available_minutes from public.study_plan_versions where id=:'version_id'),30,'availability is snapshotted');
select extensions.is((select count(*) from public.study_plan_items where plan_version_id=:'version_id'),2::bigint,'allocated and unallocated recommendations persist');
select extensions.is((select count(*) from public.study_plan_items where status='unallocated'),1::bigint,'insufficient capacity preserves unallocated item');
select extensions.ok((select justification ? 'reasons' from public.study_plan_items where status='planned'),'structured explanation is persisted');
select extensions.is(public.persist_study_plan('Plano de sete dias',null,'2026-07-23','2026-07-29',30,'[]','{}',repeat('a',64),'manual','[]'),:'version_id'::uuid,'same input is idempotent');
select extensions.is((select count(*) from public.study_plan_versions),1::bigint,'idempotency creates no duplicate version');
select extensions.throws_ok($$insert into public.study_plans(student_id,objective) values(auth.uid(),'Browser bypass')$$,'42501',null,'browser cannot write plans directly');

select id as item_id from public.study_plan_items where plan_version_id=:'version_id' and status='planned' \gset
select public.record_study_plan_item_action(:'item_id'::uuid,'started',null,null) as start_action \gset
select extensions.is((select status from public.study_plan_items where id=:'item_id'),'in_progress','item can be started');
select extensions.is((select count(*) from public.study_plan_item_actions where id=:'start_action'),1::bigint,'start execution is appended');
select extensions.is((select count(*) from public.learning_events where event_type='StudyPlanItemStarted'),1::bigint,'start feeds timeline');
select public.record_study_plan_item_action(:'item_id'::uuid,'completed',28::smallint,null) as complete_action \gset
select extensions.is((select status from public.study_plan_items where id=:'item_id'),'completed','item can be completed');
select extensions.is((select actual_minutes from public.study_plan_item_actions where id=:'complete_action'),28::smallint,'actual duration is persisted');
select extensions.is((select count(*) from public.learning_events where event_type='StudySessionCompleted'),1::bigint,'completion feeds Learning Event Store');
select extensions.throws_ok(format('select public.record_study_plan_item_action(%L,%L,null,null)',:'item_id','started'),'22023',null,'invalid transition is rejected');
select extensions.throws_ok(format('delete from public.study_plan_item_actions where id=%L',:'start_action'),'42501',null,'browser cannot erase execution history');

select public.persist_study_plan(
  'Plano recalculado',null,'2026-07-23','2026-07-29',30,'[]',
  '{"executionRevision":"completed"}',repeat('b',64),'item_completed',
  '[{"competencyId":"54000000-0000-4000-8000-000000000002","itemType":"complementary_diagnosis","priority":0.8,"estimatedMinutes":30,"plannedDate":"2026-07-24","position":1,"status":"planned","origin":"learning-gap-engine","justification":{"reasons":[{"code":"unmeasured","contribution":0.5,"detail":"Sem evidência"}]},"sourceSnapshot":{"mastery":0},"replanCount":0}]'
) as version_two \gset
select extensions.is((select current_version from public.study_plans),2,'recalculation advances version');
select extensions.is((select count(*) from public.study_plan_versions),2::bigint,'previous plan version is preserved');
select extensions.is((select status from public.study_plan_versions where id=:'version_id'),'superseded','previous version is marked historical');
select extensions.is((select trigger_reason from public.study_plan_versions where id=:'version_two'),'item_completed','recalculation trigger is audited');
select extensions.throws_ok($$select public.persist_study_plan('Overload',null,'2026-07-23','2026-07-29',10,'[]','{}',repeat('c',64),'manual','[{"competencyId":"54000000-0000-4000-8000-000000000001","itemType":"review","priority":0.5,"estimatedMinutes":30,"plannedDate":"2026-07-23","position":1,"status":"planned","origin":"test","justification":{"reasons":[]},"sourceSnapshot":{},"replanCount":0}]')$$,'23514',null,'database refuses planned load above availability');

set local request.jwt.claims='{"sub":"82828282-8282-4282-8282-828282828282","role":"authenticated"}';
select extensions.is((select count(*) from public.study_plans),0::bigint,'RLS isolates plans');
select extensions.is((select count(*) from public.study_plan_items),0::bigint,'RLS isolates plan items');
set local role anon;set local request.jwt.claims='{}';
select extensions.throws_ok($$select public.persist_study_plan('Unauthorized',null,current_date,current_date,0,'[]','{}',repeat('d',64),'manual','[]')$$,'42501',null,'anonymous cannot generate plans');
select * from extensions.finish();
rollback;

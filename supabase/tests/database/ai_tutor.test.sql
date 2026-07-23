begin;
set local role postgres;
set local search_path=public,extensions;
select extensions.plan(17);
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data) values
('91919191-9191-4191-8191-919191919191','00000000-0000-0000-0000-000000000000','authenticated','authenticated','tutor-a@example.test','',now(),now(),now(),'{}','{"display_name":"Tutor A"}'),
('92929292-9292-4292-8292-929292929292','00000000-0000-0000-0000-000000000000','authenticated','authenticated','tutor-b@example.test','',now(),now(),now(),'{}','{"display_name":"Tutor B"}');

set local role authenticated;
set local request.jwt.claims='{"sub":"91919191-9191-4191-8191-919191919191","role":"authenticated"}';
select public.create_tutor_conversation('general',null,null) as conversation_id \gset
select extensions.is((select count(*) from public.tutor_conversations),1::bigint,'conversation is created for current user');
select extensions.is((select student_id from public.tutor_conversations where id=:'conversation_id'),'91919191-9191-4191-8191-919191919191'::uuid,'owner is derived from JWT');
select extensions.throws_ok($$insert into public.tutor_conversations(student_id,mode) values(auth.uid(),'general')$$,'42501',null,'browser cannot insert directly');

select public.begin_tutor_generation(
  :'conversation_id','93939393-9393-4393-8393-939393939393','Explique sepse','gpt-5.6-sol','tutor-system-v1'
) as generation \gset
select extensions.is((select count(*) from public.tutor_messages),2::bigint,'user and assistant messages append atomically');
select extensions.is((select count(*) from public.tutor_generations),1::bigint,'generation audit is created');
select extensions.is((select status from public.tutor_messages where role='assistant'),'streaming','assistant begins streaming');
select extensions.throws_ok($$delete from public.tutor_messages$$,'42501',null,'browser cannot delete history');

select public.finish_tutor_generation(
  '93939393-9393-4393-8393-939393939393','Sepse é uma disfunção orgânica.','complete','resp_test',
  20,10,30,240,null,
  '[{"type":"competency","entityId":"54000000-0000-4000-8000-000000000001","label":"Sepse","snapshot":{"code":"COMP-SEPSE"}}]'
);
select extensions.is((select status from public.tutor_generations),'complete','generation completes');
select extensions.is((select total_tokens from public.tutor_generations),30,'usage is persisted');
select extensions.is((select estimated_cost_microusd from public.tutor_generations),400::bigint,'estimated model cost is persisted');
select extensions.is((select content from public.tutor_messages where role='assistant'),'Sepse é uma disfunção orgânica.','assistant output is persisted');
select extensions.is((select count(*) from public.tutor_context_references),1::bigint,'grounding reference is persisted');
select extensions.is((select openai_response_id from public.tutor_generations),'resp_test','provider response is audited');

select public.archive_tutor_conversation(:'conversation_id');
select extensions.is((select status from public.tutor_conversations),'archived','conversation can be archived');
select extensions.throws_ok(format($$select public.begin_tutor_generation(%L,'94949494-9494-4494-8494-949494949494','Nova','gpt-test','tutor-system-v1')$$,:'conversation_id'),'P0001','conversation unavailable','archived conversation cannot generate');

set local request.jwt.claims='{"sub":"92929292-9292-4292-8292-929292929292","role":"authenticated"}';
select extensions.is((select count(*) from public.tutor_conversations),0::bigint,'RLS isolates conversations');
select extensions.is((select count(*) from public.tutor_messages),0::bigint,'RLS isolates messages');
select * from extensions.finish();
rollback;

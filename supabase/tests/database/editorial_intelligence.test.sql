begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(21);

insert into auth.users (
  id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,
  created_at,updated_at,raw_app_meta_data,raw_user_meta_data
) values
('e1000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','editor@example.test','',now(),now(),now(),'{}','{"display_name":"Editor E2E"}'),
('e1000000-0000-4000-8000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','mentor@example.test','',now(),now(),now(),'{}','{"display_name":"Mentor E2E"}'),
('e1000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','admin@example.test','',now(),now(),now(),'{}','{"display_name":"Admin E2E"}'),
('e1000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','student@example.test','',now(),now(),now(),'{}','{"display_name":"Aluno E2E"}');

insert into public.user_roles(user_id,role) values
('e1000000-0000-4000-8000-000000000001','editor'),
('e1000000-0000-4000-8000-000000000002','mentor'),
('e1000000-0000-4000-8000-000000000003','admin');
insert into public.mentor_profiles(user_id,specialty_id,professional_name,authorization_status)
select 'e1000000-0000-4000-8000-000000000002',id,'Mentor E2E','authorized'
from public.specialties order by name limit 1;
insert into public.medical_specialty_owners(
  specialty_id,mentor_id,owner_role,authorization_reference
)
select specialty_id,user_id,'co_owner','test:editorial-intelligence'
from public.mentor_profiles
where user_id='e1000000-0000-4000-8000-000000000002';

insert into public.learning_contents(
  id,canonical_key,slug,specialty_id,assigned_mentor_id,created_by
) values(
  'e2000000-0000-4000-8000-000000000001','demo.sepsis','demo-sepsis',
  (select specialty_id from public.mentor_profiles
   where user_id='e1000000-0000-4000-8000-000000000002'),
  'e1000000-0000-4000-8000-000000000002',
  'e1000000-0000-4000-8000-000000000001'
);
insert into public.learning_content_versions(
  id,content_id,version_number,title,estimated_minutes,objectives,summary,
  sections,key_points,common_mistakes,quick_review,editorial_status,
  ai_assisted,ai_model,prompt_version,author_id,is_synthetic,content_hash
) values(
  'e3000000-0000-4000-8000-000000000001',
  'e2000000-0000-4000-8000-000000000001',1,'Choque séptico',20,
  '["Reconhecer prioridades"]','Resumo demonstrativo com extensão suficiente.',
  '[{"heading":"Primeiros passos","body":"Conteúdo sintético para validar a revisão médica."}]',
  '[]','[]','[]','awaiting_mentor_review',true,'gpt-5.6-sol',
  'editorial-mvp-v1','e1000000-0000-4000-8000-000000000001',true,
  public.editorial_version_hash(
    'Choque séptico',null,'["Reconhecer prioridades"]',
    'Resumo demonstrativo com extensão suficiente.',
    '[{"heading":"Primeiros passos","body":"Conteúdo sintético para validar a revisão médica."}]',
    '[]',null,null,'[]','[]',null,null
  )
);
insert into public.content_references(
  id,title,reference_type,origin,verification_status,verified_by,verified_at
) values(
  'e4000000-0000-4000-8000-000000000001','Referência oficial demonstrativa',
  'official_site','test','verified','e1000000-0000-4000-8000-000000000001',now()
);
insert into public.learning_content_version_references(version_id,reference_id,is_required)
values('e3000000-0000-4000-8000-000000000001','e4000000-0000-4000-8000-000000000001',true);
insert into public.content_reference_specialties(reference_id,specialty_id)
select 'e4000000-0000-4000-8000-000000000001',specialty_id
from public.mentor_profiles
where user_id='e1000000-0000-4000-8000-000000000002';

select extensions.is(
  (select count(*) from public.user_roles where role='student' and user_id in (
    'e1000000-0000-4000-8000-000000000001',
    'e1000000-0000-4000-8000-000000000002',
    'e1000000-0000-4000-8000-000000000003',
    'e1000000-0000-4000-8000-000000000004'
  )),4::bigint,
  'all identities receive the student base role'
);
select extensions.ok(public.has_app_role('admin') is false,'postgres without JWT does not inherit application role');

set local role authenticated;
set local request.jwt.claims='{"sub":"e1000000-0000-4000-8000-000000000004","role":"authenticated"}';
select extensions.is((select count(*) from public.learning_content_versions where id='e3000000-0000-4000-8000-000000000001'),0::bigint,'student cannot read drafts');
select extensions.is(
  public.request_content_review_priority(
    'e3000000-0000-4000-8000-000000000001','student-request-1'
  ),
  public.request_content_review_priority(
    'e3000000-0000-4000-8000-000000000001','student-request-2'
  ),
  'priority request is idempotent'
);
select extensions.is((select count(*) from public.content_review_requests where version_id='e3000000-0000-4000-8000-000000000001'),1::bigint,'priority requests consolidate');
select extensions.throws_ok(
  $$select public.publish_learning_content('e3000000-0000-4000-8000-000000000001','forbidden')$$,
  'P0001','Forbidden','student cannot publish'
);

set local request.jwt.claims='{"sub":"e1000000-0000-4000-8000-000000000002","role":"authenticated"}';
select extensions.ok(public.has_app_role('mentor'),'mentor role is resolved server-side');
select extensions.throws_ok(
  $$select public.review_learning_content(
    'e3000000-0000-4000-8000-000000000001','approved','curta',null,null,'review-short'
  )$$,'23514',null,'approval requires an explicit declaration'
);
select extensions.lives_ok(
  $$select public.review_learning_content(
    'e3000000-0000-4000-8000-000000000001','approved',
    'Confirmo que revisei esta versão para fins educacionais dentro da minha área de atuação.',
    null,null,'review-approved'
  )$$,'authorized mentor approves assigned exact version'
);
select extensions.is(
  (select editorial_status from public.learning_content_versions where id='e3000000-0000-4000-8000-000000000001'),
  'mentor_approved','approved version advances without publication'
);
select extensions.is((select count(*) from public.content_reviews where version_id='e3000000-0000-4000-8000-000000000001'),1::bigint,'review is append-only evidence');

set local request.jwt.claims='{"sub":"e1000000-0000-4000-8000-000000000001","role":"authenticated"}';
select extensions.throws_ok(
  $$select public.publish_learning_content('e3000000-0000-4000-8000-000000000001','editor-publish')$$,
  'P0001','Forbidden','editor cannot publish'
);

set local request.jwt.claims='{"sub":"e1000000-0000-4000-8000-000000000003","role":"authenticated"}';
select extensions.lives_ok(
  $$select public.publish_learning_content('e3000000-0000-4000-8000-000000000001','admin-publish')$$,
  'admin publishes approved version with verified reference'
);
select extensions.is(
  (select current_published_version_id from public.learning_contents where id='e2000000-0000-4000-8000-000000000001'),
  'e3000000-0000-4000-8000-000000000001'::uuid,'published pointer is explicit'
);
select extensions.is(
  (select count(*) from public.editorial_audit_events where resource_id='e2000000-0000-4000-8000-000000000001'),
  3::bigint,'request, review and publication are audited'
);
select extensions.throws_ok(
  $$update public.learning_content_versions set summary='Alteração silenciosa' where id='e3000000-0000-4000-8000-000000000001'$$,
  '42501',null,
  'published version body is immutable'
);
select extensions.throws_ok(
  $$delete from public.editorial_audit_events where resource_id='e2000000-0000-4000-8000-000000000001'$$,
  '42501',null,'authenticated admin has no direct audit mutation grant'
);

set local request.jwt.claims='{"sub":"e1000000-0000-4000-8000-000000000004","role":"authenticated"}';
select extensions.is((select count(*) from public.learning_content_versions where id='e3000000-0000-4000-8000-000000000001'),1::bigint,'student sees published version');
select extensions.is((select count(*) from public.content_reviews where version_id='e3000000-0000-4000-8000-000000000001'),1::bigint,'student can inspect review evidence for published content');
select extensions.is((select count(*) from public.editorial_audit_events where actor_id<>'e1000000-0000-4000-8000-000000000004'),0::bigint,'student cannot inspect staff audit');
select extensions.is((select count(*) from public.editorial_email_events),0::bigint,'student cannot inspect mentor email events');

select * from extensions.finish();
rollback;

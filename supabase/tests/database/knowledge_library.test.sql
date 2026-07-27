begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(8);

insert into auth.users(id, email) values
  ('87000000-0000-4000-8000-000000000001', 'library-student@example.test'),
  ('87000000-0000-4000-8000-000000000002', 'library-editor@example.test');
insert into public.user_roles(user_id, role) values
  ('87000000-0000-4000-8000-000000000002', 'editor');

select extensions.has_table(
  'public', 'knowledge_duplicate_decisions',
  'duplicate decisions are persisted outside canonical knowledge entities'
);
select extensions.ok(
  (select relrowsecurity from pg_class
   where oid = 'public.knowledge_duplicate_decisions'::regclass),
  'duplicate decisions have RLS'
);

set local role authenticated;
set local request.jwt.claims =
  '{"sub":"87000000-0000-4000-8000-000000000001","role":"authenticated"}';
set local request.jwt.claim.sub = '87000000-0000-4000-8000-000000000001';
select extensions.throws_ok(
  $$select public.resolve_knowledge_duplicate(
    'content',
    '87000000-0000-4000-8000-000000000010',
    '87000000-0000-4000-8000-000000000011',
    'not_duplicate',null,'Itens possuem finalidades editoriais diferentes',
    '87000000-0000-4000-8000-000000000012'
  )$$,
  'P0001','Forbidden','student cannot decide a duplicate'
);
select extensions.is(
  (select count(*) from public.knowledge_duplicate_decisions),
  0::bigint, 'student cannot read duplicate decisions'
);

set local request.jwt.claims =
  '{"sub":"87000000-0000-4000-8000-000000000002","role":"authenticated"}';
set local request.jwt.claim.sub = '87000000-0000-4000-8000-000000000002';
select extensions.lives_ok(
  $$select public.resolve_knowledge_duplicate(
    'content',
    '87000000-0000-4000-8000-000000000010',
    '87000000-0000-4000-8000-000000000011',
    'confirmed_duplicate',
    '87000000-0000-4000-8000-000000000010',
    'Mesmo conteúdo e mesma identidade editorial',
    '87000000-0000-4000-8000-000000000012'
  )$$,
  'editor records an explicit canonical decision'
);
select extensions.is(
  (select canonical_id from public.knowledge_duplicate_decisions limit 1),
  '87000000-0000-4000-8000-000000000010'::uuid,
  'canonical item is explicit'
);
select extensions.ok(
  exists(
    select 1 from public.editorial_audit_events
    where action='knowledge_duplicate_confirmed_duplicate'
  ),
  'duplicate decision is audited'
);
select extensions.throws_ok(
  $$delete from public.knowledge_duplicate_decisions$$,
  '42501',null,'duplicate decision history is append-only for staff'
);

select * from extensions.finish();
rollback;

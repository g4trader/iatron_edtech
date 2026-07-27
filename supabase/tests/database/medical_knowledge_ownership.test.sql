begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(14);

insert into auth.users(id, email) values
  ('86000000-0000-4000-8000-000000000001', 'owner-admin@example.test'),
  ('86000000-0000-4000-8000-000000000002', 'owner-editor@example.test'),
  ('86000000-0000-4000-8000-000000000003', 'owner-primary@example.test'),
  ('86000000-0000-4000-8000-000000000004', 'owner-replacement@example.test');
insert into public.user_roles(user_id, role) values
  ('86000000-0000-4000-8000-000000000001', 'admin'),
  ('86000000-0000-4000-8000-000000000002', 'editor'),
  ('86000000-0000-4000-8000-000000000003', 'mentor'),
  ('86000000-0000-4000-8000-000000000004', 'mentor');
insert into public.mentor_profiles(
  user_id, specialty_id, professional_name, authorization_status
)
select '86000000-0000-4000-8000-000000000003', id,
       'Owner principal', 'authorized'
from public.specialties order by name limit 1;
insert into public.mentor_profiles(
  user_id, specialty_id, professional_name, authorization_status
)
select '86000000-0000-4000-8000-000000000004', id,
       'Owner substituto', 'authorized'
from public.specialties order by name limit 1;

select extensions.has_table(
  'public', 'medical_specialty_ownership_history',
  'ownership history is explicit'
);
select extensions.ok(
  (select relrowsecurity from pg_class
   where oid = 'public.medical_specialty_ownership_history'::regclass),
  'ownership history has RLS'
);

set local role authenticated;
set local request.jwt.claims =
  '{"sub":"86000000-0000-4000-8000-000000000002","role":"authenticated"}';
select extensions.throws_ok(
  $$select public.assign_medical_specialty_owner(
    (select specialty_id from public.mentor_profiles
     where user_id='86000000-0000-4000-8000-000000000003'),
    '86000000-0000-4000-8000-000000000003','primary',
    'authorization:editor','86000000-0000-4000-8000-000000000010'
  )$$,
  'P0001','Forbidden','editor cannot assign a scientific owner'
);

set local request.jwt.claims =
  '{"sub":"86000000-0000-4000-8000-000000000003","role":"authenticated"}';
select extensions.throws_ok(
  $$select public.assign_medical_specialty_owner(
    (select specialty_id from public.mentor_profiles
     where user_id='86000000-0000-4000-8000-000000000003'),
    '86000000-0000-4000-8000-000000000003','primary',
    'authorization:self','86000000-0000-4000-8000-000000000011'
  )$$,
  'P0001','Forbidden','mentor cannot self-assign'
);

set local request.jwt.claims =
  '{"sub":"86000000-0000-4000-8000-000000000001","role":"authenticated"}';
select extensions.lives_ok(
  $$select public.assign_medical_specialty_owner(
    (select specialty_id from public.mentor_profiles
     where user_id='86000000-0000-4000-8000-000000000003'),
    '86000000-0000-4000-8000-000000000003','primary',
    'authorization:record-1','86000000-0000-4000-8000-000000000012'
  )$$,
  'admin assigns the primary owner with evidence'
);
select extensions.is(
  (select count(*) from public.medical_specialty_owners
   where mentor_id='86000000-0000-4000-8000-000000000003'
     and status='active' and ends_at is null),
  1::bigint, 'primary assignment is active'
);
select extensions.lives_ok(
  $$select public.assign_medical_specialty_owner(
    (select specialty_id from public.mentor_profiles
     where user_id='86000000-0000-4000-8000-000000000004'),
    '86000000-0000-4000-8000-000000000004','primary',
    'authorization:record-2','86000000-0000-4000-8000-000000000013'
  )$$,
  'admin explicitly replaces the primary owner'
);
select extensions.is(
  (select status from public.medical_specialty_owners
   where mentor_id='86000000-0000-4000-8000-000000000003'
   order by created_at desc limit 1),
  'inactive', 'replaced owner is retained as inactive'
);
select extensions.is(
  (select count(*) from public.medical_specialty_owners
   where owner_role='primary' and status='active' and ends_at is null
     and specialty_id=(
       select specialty_id from public.mentor_profiles
       where user_id='86000000-0000-4000-8000-000000000004'
     )),
  1::bigint, 'only one primary owner remains active'
);
select extensions.ok(
  (select count(*) >= 3 from public.medical_specialty_ownership_history
   where specialty_id=(
     select specialty_id from public.mentor_profiles
     where user_id='86000000-0000-4000-8000-000000000004'
   )),
  'assignment and replacement preserve append-only history'
);
select extensions.ok(
  exists(
    select 1 from public.editorial_audit_events
    where action='specialty_owner_replaced'
  ),
  'replacement is audited'
);
select extensions.lives_ok(
  $$select public.set_medical_specialty_owner_status(
    (select id from public.medical_specialty_owners
     where mentor_id='86000000-0000-4000-8000-000000000004'
       and status='active' limit 1),
    'temporarily_unavailable','Cobertura temporária organizada',
    now() + interval '7 days','86000000-0000-4000-8000-000000000014'
  )$$,
  'admin records temporary unavailability'
);
select extensions.is(
  (select status from public.medical_specialty_owners
   where mentor_id='86000000-0000-4000-8000-000000000004'
   order by created_at desc limit 1),
  'temporarily_unavailable', 'temporary unavailability is explicit'
);
select extensions.throws_ok(
  $$delete from public.medical_specialty_ownership_history$$,
  '42501',null,'ownership history cannot be deleted by authenticated admin'
);

select * from extensions.finish();
rollback;

begin;
select plan(16);

insert into auth.users(id, email) values
  ('85000000-0000-4000-8000-000000000001', 'specialty-owner@example.test'),
  ('85000000-0000-4000-8000-000000000002', 'pending-owner@example.test');
insert into public.user_roles(user_id, role) values
  ('85000000-0000-4000-8000-000000000001', 'mentor'),
  ('85000000-0000-4000-8000-000000000002', 'mentor');
insert into public.mentor_profiles(
  user_id, specialty_id, professional_name, authorization_status
)
select '85000000-0000-4000-8000-000000000001', id, 'Owner autorizado', 'authorized'
from public.specialties order by name limit 1;
insert into public.mentor_profiles(
  user_id, specialty_id, professional_name, authorization_status
)
select '85000000-0000-4000-8000-000000000002', id, 'Owner pendente', 'pending'
from public.specialties order by name limit 1;

select ok(
  exists(select 1 from public.specialties),
  'MedicalSpecialty reuses the canonical specialties aggregate'
);
select has_table('public', 'medical_specialty_owners', 'specialty ownership exists');
select has_table('public', 'competency_specialties', 'competency specialty links exist');
select has_table('public', 'content_reference_specialties', 'reference specialty links exist');
select col_is_pk(
  'public', 'medical_specialty_owners',
  array['specialty_id','mentor_id'],
  'ownership is unique per specialty and mentor'
);
select throws_ok(
  $$
    insert into public.medical_specialty_owners(
      specialty_id, mentor_id, owner_role, authorization_reference
    )
    select specialty_id, user_id, 'co_owner', 'test:pending'
    from public.mentor_profiles
    where user_id = '85000000-0000-4000-8000-000000000002'
  $$,
  'Active specialty ownership requires an authorized mentor',
  'pending mentor cannot become an active owner'
);
insert into public.medical_specialty_owners(
  specialty_id, mentor_id, owner_role, authorization_reference
)
select specialty_id, user_id, 'co_owner', 'test:authorization-record'
from public.mentor_profiles
where user_id = '85000000-0000-4000-8000-000000000001'
on conflict (specialty_id, mentor_id) do update
set status = 'active', authorization_reference = excluded.authorization_reference;
select is(
  (select status from public.medical_specialty_owners
   where mentor_id = '85000000-0000-4000-8000-000000000001'),
  'active',
  'authorized mentor owns the specialty'
);
select ok(
  (select count(*) > 0 from public.competency_specialties),
  'competencies are explicitly linked to specialties'
);
select ok(
  not exists(
    select 1 from public.competency_specialties cs
    left join public.competencies c on c.id = cs.competency_id
    left join public.specialties s on s.id = cs.specialty_id
    where c.id is null or s.id is null
  ),
  'competency links preserve referential integrity'
);
select throws_ok(
  $$
    insert into public.learning_contents(
      canonical_key, slug, created_by
    ) values (
      'test.specialty.missing', 'test-specialty-missing',
      '85000000-0000-4000-8000-000000000001'
    )
  $$,
  'Learning content requires a medical specialty',
  'new content cannot omit its specialty'
);
select ok(
  exists(
    select 1 from pg_indexes
    where indexname = 'medical_specialty_primary_owner_idx'
  ),
  'one active primary owner is enforced per specialty'
);
select ok(
  exists(
    select 1 from pg_indexes
    where indexname = 'competency_specialties_specialty_idx'
  ),
  'competency specialty navigation is indexed'
);
select ok(
  exists(
    select 1 from pg_indexes
    where indexname = 'content_reference_specialties_specialty_idx'
  ),
  'reference specialty navigation is indexed'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.medical_specialty_owners'::regclass),
  'ownership has RLS'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.competency_specialties'::regclass),
  'competency links have RLS'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.content_reference_specialties'::regclass),
  'reference links have RLS'
);

select * from finish();
rollback;

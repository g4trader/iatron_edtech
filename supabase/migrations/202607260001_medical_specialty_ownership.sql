-- MedicalSpecialty is the existing public.specialties aggregate.
-- This migration adds scientific ownership and the missing explicit links
-- without creating a parallel taxonomy.

create table public.medical_specialty_owners (
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete restrict,
  owner_role text not null check (owner_role in ('primary','co_owner')),
  status text not null default 'active'
    check (status in ('active','suspended','revoked')),
  authorization_reference text not null
    check (char_length(authorization_reference) between 3 and 240),
  authorized_by uuid references public.profiles(id) on delete restrict,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (specialty_id, mentor_id),
  check (ends_at is null or ends_at >= starts_at)
);
create unique index medical_specialty_primary_owner_idx
  on public.medical_specialty_owners(specialty_id)
  where owner_role = 'primary' and status = 'active';
create index medical_specialty_owners_mentor_idx
  on public.medical_specialty_owners(mentor_id, status);
create trigger medical_specialty_owners_set_updated_at
before update on public.medical_specialty_owners
for each row execute function public.set_updated_at();

create or replace function public.validate_medical_specialty_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'active' and not exists (
    select 1 from public.mentor_profiles mp
    where mp.user_id = new.mentor_id
      and mp.authorization_status = 'authorized'
  ) then
    raise exception 'Active specialty ownership requires an authorized mentor';
  end if;
  return new;
end;
$$;
create trigger medical_specialty_owners_validate
before insert or update on public.medical_specialty_owners
for each row execute function public.validate_medical_specialty_owner();

create or replace function public.owns_medical_specialty(p_specialty_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.medical_specialty_owners mso
    where mso.specialty_id = p_specialty_id
      and mso.mentor_id = (select auth.uid())
      and mso.status = 'active'
      and (mso.ends_at is null or mso.ends_at > now())
  );
$$;

create or replace function public.assign_medical_specialty_owner(
  p_specialty_id uuid,
  p_mentor_id uuid,
  p_owner_role text,
  p_authorization_reference text,
  p_request_id text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  previous_state text;
begin
  if not public.can_manage_editorial() then raise exception 'Forbidden'; end if;
  if p_owner_role not in ('primary','co_owner') then
    raise exception 'Invalid specialty owner role';
  end if;
  select concat(owner_role, ':', status) into previous_state
  from public.medical_specialty_owners
  where specialty_id = p_specialty_id and mentor_id = p_mentor_id;
  insert into public.medical_specialty_owners(
    specialty_id, mentor_id, owner_role, status,
    authorization_reference, authorized_by
  ) values (
    p_specialty_id, p_mentor_id, p_owner_role, 'active',
    p_authorization_reference, actor
  )
  on conflict (specialty_id, mentor_id) do update set
    owner_role = excluded.owner_role,
    status = 'active',
    authorization_reference = excluded.authorization_reference,
    authorized_by = actor,
    starts_at = now(),
    ends_at = null;
  insert into public.editorial_audit_events(
    actor_id, actor_role, resource_type, resource_id, action,
    previous_state, next_state, request_id, metadata
  ) values (
    actor,
    case when public.has_app_role('admin') then 'admin' else 'editor' end,
    'medical_specialty', p_specialty_id, 'specialty_owner_assigned',
    previous_state, concat(p_owner_role, ':active'),
    coalesce(p_request_id, gen_random_uuid()::text),
    jsonb_build_object('mentorId', p_mentor_id)
  );
  return p_specialty_id;
end;
$$;

with ranked as (
  select mp.user_id, mp.specialty_id,
    row_number() over (
      partition by mp.specialty_id order by mp.created_at, mp.user_id
    ) as position
  from public.mentor_profiles mp
  where mp.specialty_id is not null
    and mp.authorization_status = 'authorized'
)
insert into public.medical_specialty_owners(
  specialty_id, mentor_id, owner_role, authorization_reference
)
select specialty_id, user_id,
  case when position = 1 then 'primary' else 'co_owner' end,
  'legacy:mentor_profiles.authorization_status'
from ranked
on conflict do nothing;

create table public.competency_specialties (
  competency_id uuid not null references public.competencies(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  relationship text not null default 'primary'
    check (relationship in ('primary','related')),
  created_at timestamptz not null default now(),
  primary key (competency_id, specialty_id)
);
create index competency_specialties_specialty_idx
  on public.competency_specialties(specialty_id, competency_id);

insert into public.competency_specialties(competency_id, specialty_id, relationship)
select distinct c.id, sa.specialty_id, 'primary'
from public.competencies c
join public.subthemes st on st.id = c.subtheme_id
join public.themes t on t.id = st.theme_id
join public.specialty_areas sa on sa.area_id = t.area_id
on conflict do nothing;

create or replace function public.sync_competency_specialties()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_table_name = 'competencies' then
    insert into public.competency_specialties(competency_id, specialty_id)
    select new.id, sa.specialty_id
    from public.subthemes st
    join public.themes t on t.id = st.theme_id
    join public.specialty_areas sa on sa.area_id = t.area_id
    where st.id = new.subtheme_id
    on conflict do nothing;
  else
    insert into public.competency_specialties(competency_id, specialty_id)
    select c.id, new.specialty_id
    from public.competencies c
    join public.subthemes st on st.id = c.subtheme_id
    join public.themes t on t.id = st.theme_id
    where t.area_id = new.area_id
    on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger competencies_specialty_sync
after insert or update of subtheme_id on public.competencies
for each row execute function public.sync_competency_specialties();
create trigger specialty_areas_competency_sync
after insert on public.specialty_areas
for each row execute function public.sync_competency_specialties();

create table public.content_reference_specialties (
  reference_id uuid not null references public.content_references(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (reference_id, specialty_id)
);
create index content_reference_specialties_specialty_idx
  on public.content_reference_specialties(specialty_id, reference_id);

insert into public.content_reference_specialties(reference_id, specialty_id)
select distinct lcr.reference_id, lc.specialty_id
from public.learning_content_version_references lcr
join public.learning_content_versions lcv on lcv.id = lcr.version_id
join public.learning_contents lc on lc.id = lcv.content_id
where lc.specialty_id is not null
on conflict do nothing;

update public.learning_contents lc
set specialty_id = mp.specialty_id
from public.mentor_profiles mp
where lc.specialty_id is null
  and lc.assigned_mentor_id = mp.user_id
  and mp.specialty_id is not null;

update public.learning_contents lc
set specialty_id = candidate.specialty_id
from (
  select cs.competency_id, min(cs.specialty_id::text)::uuid as specialty_id
  from public.competency_specialties cs
  group by cs.competency_id
  having count(*) = 1
) candidate
where lc.specialty_id is null
  and lc.competency_id = candidate.competency_id;

do $$
begin
  if exists(select 1 from public.learning_contents where specialty_id is null) then
    raise exception 'Existing learning content without a medical specialty requires editorial classification';
  end if;
end;
$$;
alter table public.learning_contents alter column specialty_id set not null;

create or replace function public.validate_learning_content_specialty()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.specialty_id is null then
    raise exception 'Learning content requires a medical specialty';
  end if;
  if new.competency_id is not null and not exists (
    select 1 from public.competency_specialties cs
    where cs.competency_id = new.competency_id
      and cs.specialty_id = new.specialty_id
  ) then
    raise exception 'Content competency must belong to its medical specialty';
  end if;
  return new;
end;
$$;
create trigger learning_contents_validate_specialty
before insert or update of specialty_id, competency_id on public.learning_contents
for each row execute function public.validate_learning_content_specialty();

create or replace function public.validate_published_specialty_content()
returns trigger language plpgsql set search_path = '' as $$
declare
  specialty uuid;
begin
  if new.editorial_status <> 'published' then return new; end if;
  select specialty_id into specialty
  from public.learning_contents where id = new.content_id;
  if specialty is null then
    raise exception 'Published content requires a medical specialty';
  end if;
  if not exists (
    select 1 from public.medical_specialty_owners mso
    where mso.specialty_id = specialty and mso.status = 'active'
      and (mso.ends_at is null or mso.ends_at > now())
  ) then
    raise exception 'Published content requires an active specialty owner';
  end if;
  if exists (
    select 1
    from public.learning_content_version_references lcr
    where lcr.version_id = new.id
      and not exists (
        select 1 from public.content_reference_specialties crs
        where crs.reference_id = lcr.reference_id
          and crs.specialty_id = specialty
      )
  ) then
    raise exception 'Published references must belong to the content specialty';
  end if;
  return new;
end;
$$;
create constraint trigger learning_content_versions_specialty_governance
after insert or update of editorial_status on public.learning_content_versions
deferrable initially deferred
for each row execute function public.validate_published_specialty_content();

create or replace function public.validate_published_question_specialty()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'published' and not exists (
    select 1 from public.question_version_specialties qvs
    where qvs.question_version_id = new.id
  ) then
    raise exception 'Published question requires a medical specialty';
  end if;
  return new;
end;
$$;
create constraint trigger question_versions_specialty_governance
after update of status on public.question_versions
deferrable initially deferred
for each row execute function public.validate_published_question_specialty();

alter table public.medical_specialty_owners enable row level security;
alter table public.competency_specialties enable row level security;
alter table public.content_reference_specialties enable row level security;

revoke all on public.medical_specialty_owners,
  public.competency_specialties, public.content_reference_specialties
  from anon, authenticated;
grant select on public.medical_specialty_owners,
  public.competency_specialties, public.content_reference_specialties
  to authenticated;
revoke insert, update, delete on public.medical_specialty_owners,
  public.competency_specialties, public.content_reference_specialties
  from authenticated;

create policy medical_specialty_owners_read on public.medical_specialty_owners
for select to authenticated using (
  status = 'active'
  or mentor_id = (select auth.uid())
  or public.can_manage_editorial()
);
create policy medical_specialty_owners_manage on public.medical_specialty_owners
for all to authenticated using (public.can_manage_editorial())
with check (public.can_manage_editorial());

create policy competency_specialties_read on public.competency_specialties
for select to authenticated using (true);
create policy competency_specialties_manage on public.competency_specialties
for all to authenticated using (public.can_manage_editorial())
with check (public.can_manage_editorial());

create policy content_reference_specialties_read
on public.content_reference_specialties
for select to authenticated using (
  public.has_app_role('mentor') or public.can_manage_editorial()
);
create policy content_reference_specialties_manage
on public.content_reference_specialties
for all to authenticated using (public.can_manage_editorial())
with check (public.can_manage_editorial());

create policy learning_contents_specialty_owner
on public.learning_contents for select to authenticated using (
  public.owns_medical_specialty(specialty_id)
);
create policy learning_versions_specialty_owner
on public.learning_content_versions for select to authenticated using (
  exists (
    select 1 from public.learning_contents lc
    where lc.id = content_id
      and public.owns_medical_specialty(lc.specialty_id)
  )
);
create policy content_reviews_specialty_owner
on public.content_reviews for select to authenticated using (
  exists (
    select 1 from public.learning_contents lc
    where lc.id = content_id
      and public.owns_medical_specialty(lc.specialty_id)
  )
);

grant execute on function public.owns_medical_specialty(uuid) to authenticated;
grant execute on function public.assign_medical_specialty_owner(
  uuid,uuid,text,text,text
) to authenticated;

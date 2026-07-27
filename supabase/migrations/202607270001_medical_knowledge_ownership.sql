-- Product Vision 7.1: Medical Knowledge Ownership.
-- Reuses public.specialties as the canonical medical-domain aggregate.

alter table public.medical_specialty_owners
  add column id uuid not null default gen_random_uuid(),
  add column scope text not null default 'scientific_and_operational'
    check (scope in ('scientific','operational','scientific_and_operational')),
  add column reason text,
  add column unavailable_until timestamptz;

alter table public.medical_specialty_owners
  drop constraint medical_specialty_owners_pkey,
  add constraint medical_specialty_owners_pkey primary key (id);

drop index if exists public.medical_specialty_primary_owner_idx;
create unique index medical_specialty_primary_owner_idx
  on public.medical_specialty_owners(specialty_id)
  where owner_role = 'primary' and status = 'active' and ends_at is null;
create unique index medical_specialty_active_mentor_idx
  on public.medical_specialty_owners(specialty_id, mentor_id)
  where status in ('active', 'temporarily_unavailable') and ends_at is null;

alter table public.medical_specialty_owners
  drop constraint medical_specialty_owners_status_check;
alter table public.medical_specialty_owners
  add constraint medical_specialty_owners_status_check
  check (status in (
    'active',
    'temporarily_unavailable',
    'inactive',
    'pending_assignment'
  ));

-- Legacy profile linkage is not proof of the granular authorization required
-- for official ownership. Preserve it for reconciliation without presenting it
-- as an active scientific assignment.
update public.medical_specialty_owners
set status = 'pending_assignment',
    reason = coalesce(reason, 'Aguardando confirmação de autorização granular'),
    ends_at = coalesce(ends_at, now())
where authorization_reference like 'legacy:%';

create table public.medical_specialty_ownership_history (
  id uuid primary key default gen_random_uuid(),
  ownership_id uuid not null,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete restrict,
  owner_role text not null check (owner_role in ('primary','co_owner')),
  status text not null check (status in (
    'active',
    'temporarily_unavailable',
    'inactive',
    'pending_assignment'
  )),
  scope text not null check (scope in (
    'scientific','operational','scientific_and_operational'
  )),
  starts_at timestamptz not null,
  ends_at timestamptz,
  unavailable_until timestamptz,
  authorization_reference text not null,
  assigned_by uuid references public.profiles(id) on delete restrict,
  reason text,
  recorded_at timestamptz not null default now(),
  request_id text not null,
  operation text not null check (operation in ('created','transitioned','snapshot'))
);
create index medical_specialty_ownership_history_specialty_idx
  on public.medical_specialty_ownership_history(specialty_id, recorded_at desc);
create index medical_specialty_ownership_history_mentor_idx
  on public.medical_specialty_ownership_history(mentor_id, recorded_at desc);

insert into public.medical_specialty_ownership_history(
  ownership_id, specialty_id, mentor_id, owner_role, status, scope,
  starts_at, ends_at, unavailable_until, authorization_reference,
  assigned_by, reason, request_id, operation
)
select
  id, specialty_id, mentor_id, owner_role, status, scope,
  starts_at, ends_at, unavailable_until, authorization_reference,
  authorized_by, reason, 'migration:202607270001', 'snapshot'
from public.medical_specialty_owners;

create or replace function public.record_medical_specialty_ownership_history()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.medical_specialty_ownership_history(
    ownership_id, specialty_id, mentor_id, owner_role, status, scope,
    starts_at, ends_at, unavailable_until, authorization_reference,
    assigned_by, reason, request_id, operation
  ) values (
    new.id, new.specialty_id, new.mentor_id, new.owner_role, new.status,
    new.scope, new.starts_at, new.ends_at, new.unavailable_until,
    new.authorization_reference, new.authorized_by, new.reason,
    coalesce(current_setting('app.request_id', true), gen_random_uuid()::text),
    case when tg_op = 'INSERT' then 'created' else 'transitioned' end
  );
  return new;
end;
$$;
create trigger medical_specialty_owners_history
after insert or update on public.medical_specialty_owners
for each row execute function public.record_medical_specialty_ownership_history();

create or replace function public.assign_medical_specialty_owner(
  p_specialty_id uuid,
  p_mentor_id uuid,
  p_owner_role text,
  p_authorization_reference text,
  p_request_id text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  new_id uuid;
  previous_primary uuid;
begin
  if not public.has_app_role('admin') then raise exception 'Forbidden'; end if;
  if actor = p_mentor_id then raise exception 'Self-assignment is not permitted'; end if;
  if p_owner_role not in ('primary','co_owner') then
    raise exception 'Invalid specialty owner role';
  end if;
  if char_length(trim(coalesce(p_authorization_reference, ''))) < 3 then
    raise exception 'Authorization evidence is required';
  end if;
  if not exists (
    select 1 from public.mentor_profiles
    where user_id = p_mentor_id and authorization_status = 'authorized'
  ) then
    raise exception 'Active specialty ownership requires an authorized mentor';
  end if;

  perform set_config('app.request_id', coalesce(p_request_id, gen_random_uuid()::text), true);

  if p_owner_role = 'primary' then
    select id into previous_primary
    from public.medical_specialty_owners
    where specialty_id = p_specialty_id
      and owner_role = 'primary'
      and status in ('active','temporarily_unavailable')
      and ends_at is null
    for update;
    if previous_primary is not null then
      update public.medical_specialty_owners
      set status = 'inactive',
          ends_at = now(),
          reason = 'Substituído por transição explícita',
          updated_at = now()
      where id = previous_primary;
    end if;
  end if;

  update public.medical_specialty_owners
  set status = 'inactive',
      ends_at = now(),
      reason = 'Nova atribuição explícita registrada',
      updated_at = now()
  where specialty_id = p_specialty_id
    and mentor_id = p_mentor_id
    and status in ('active','temporarily_unavailable')
    and ends_at is null;

  insert into public.medical_specialty_owners(
    specialty_id, mentor_id, owner_role, status, scope,
    authorization_reference, authorized_by, reason
  ) values (
    p_specialty_id, p_mentor_id, p_owner_role, 'active',
    'scientific_and_operational', p_authorization_reference, actor,
    case when previous_primary is null then
      'Atribuição oficial'
    else
      'Substituição explícita de owner'
    end
  ) returning id into new_id;

  insert into public.editorial_audit_events(
    actor_id, actor_role, resource_type, resource_id, action,
    previous_state, next_state, request_id, metadata
  ) values (
    actor, 'admin', 'medical_specialty', p_specialty_id,
    case when previous_primary is null then
      'specialty_owner_assigned'
    else
      'specialty_owner_replaced'
    end,
    case when previous_primary is null then null else previous_primary::text end,
    new_id::text, coalesce(p_request_id, gen_random_uuid()::text),
    jsonb_build_object(
      'mentorId', p_mentor_id,
      'ownerRole', p_owner_role,
      'authorizationReference', p_authorization_reference
    )
  );
  return new_id;
end;
$$;

create or replace function public.set_medical_specialty_owner_status(
  p_ownership_id uuid,
  p_status text,
  p_reason text,
  p_unavailable_until timestamptz,
  p_request_id text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  current_row public.medical_specialty_owners%rowtype;
begin
  if not public.has_app_role('admin') then raise exception 'Forbidden'; end if;
  if p_status not in ('active','temporarily_unavailable','inactive','pending_assignment') then
    raise exception 'Invalid ownership status';
  end if;
  if char_length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A transition reason is required';
  end if;
  select * into current_row
  from public.medical_specialty_owners where id = p_ownership_id for update;
  if current_row.id is null then raise exception 'Ownership not found'; end if;
  if p_status = 'temporarily_unavailable' and p_unavailable_until is null then
    raise exception 'Temporary unavailability requires an end date';
  end if;
  if p_status = 'inactive'
     and current_row.owner_role = 'primary'
     and not exists (
       select 1 from public.medical_specialty_owners
       where specialty_id = current_row.specialty_id
         and owner_role = 'co_owner'
         and status = 'active'
         and ends_at is null
     ) then
    p_status := 'pending_assignment';
  end if;

  perform set_config('app.request_id', coalesce(p_request_id, gen_random_uuid()::text), true);
  update public.medical_specialty_owners
  set status = p_status,
      reason = p_reason,
      unavailable_until = case
        when p_status = 'temporarily_unavailable' then p_unavailable_until
        else null
      end,
      ends_at = case
        when p_status in ('inactive','pending_assignment') then coalesce(ends_at, now())
        else null
      end,
      updated_at = now()
  where id = p_ownership_id;

  insert into public.editorial_audit_events(
    actor_id, actor_role, resource_type, resource_id, action,
    previous_state, next_state, request_id, metadata
  ) values (
    actor, 'admin', 'medical_specialty', current_row.specialty_id,
    'specialty_owner_status_changed', current_row.status, p_status,
    coalesce(p_request_id, gen_random_uuid()::text),
    jsonb_build_object(
      'ownershipId', p_ownership_id,
      'mentorId', current_row.mentor_id,
      'reason', p_reason
    )
  );
  return p_ownership_id;
end;
$$;

alter table public.medical_specialty_ownership_history enable row level security;
revoke all on public.medical_specialty_ownership_history from anon, authenticated;
grant select on public.medical_specialty_ownership_history to authenticated;
create policy medical_specialty_ownership_history_read
on public.medical_specialty_ownership_history for select to authenticated using (
  mentor_id = (select auth.uid())
  or public.has_app_role('admin')
);

drop policy if exists medical_specialty_owners_manage
  on public.medical_specialty_owners;
create policy medical_specialty_owners_manage
on public.medical_specialty_owners for all to authenticated
using (public.has_app_role('admin'))
with check (public.has_app_role('admin'));

revoke all on function public.assign_medical_specialty_owner(
  uuid,uuid,text,text,text
) from public, anon, authenticated;
grant execute on function public.assign_medical_specialty_owner(
  uuid,uuid,text,text,text
) to authenticated;
revoke all on function public.set_medical_specialty_owner_status(
  uuid,text,text,timestamptz,text
) from public, anon, authenticated;
grant execute on function public.set_medical_specialty_owner_status(
  uuid,text,text,timestamptz,text
) to authenticated;

comment on table public.medical_specialty_ownership_history is
  'Append-only evidence for scientific and operational ownership transitions.';

-- Product Vision 7.2: auditable human decisions for deterministic duplicate candidates.

create table public.knowledge_duplicate_decisions (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null check (resource_type in ('content','question','reference')),
  resource_id uuid not null,
  candidate_id uuid not null,
  decision text not null check (decision in (
    'confirmed_duplicate','not_duplicate','merged','archived'
  )),
  canonical_id uuid,
  reason text not null check (char_length(trim(reason)) between 10 and 500),
  decided_by uuid not null references public.profiles(id) on delete restrict,
  request_id uuid not null unique,
  created_at timestamptz not null default now(),
  check (resource_id <> candidate_id),
  check (
    (decision = 'not_duplicate' and canonical_id is null)
    or
    (decision <> 'not_duplicate' and canonical_id is not null)
  )
);
create index knowledge_duplicate_decisions_pair_idx
  on public.knowledge_duplicate_decisions(
    resource_type,
    least(resource_id, candidate_id),
    greatest(resource_id, candidate_id),
    created_at desc
  );

alter table public.knowledge_duplicate_decisions enable row level security;
create policy knowledge_duplicate_decisions_staff_read
  on public.knowledge_duplicate_decisions for select to authenticated
  using (public.can_manage_editorial());

create or replace function public.resolve_knowledge_duplicate(
  p_resource_type text,
  p_resource_id uuid,
  p_candidate_id uuid,
  p_decision text,
  p_canonical_id uuid,
  p_reason text,
  p_request_id uuid
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  decision_id uuid;
begin
  if not public.can_manage_editorial() then raise exception 'Forbidden'; end if;
  if p_resource_type not in ('content','question','reference') then
    raise exception 'Invalid resource type';
  end if;
  if p_resource_id = p_candidate_id then
    raise exception 'Duplicate candidates must be different';
  end if;
  if p_decision not in (
    'confirmed_duplicate','not_duplicate','merged','archived'
  ) then raise exception 'Invalid duplicate decision'; end if;
  if p_decision <> 'not_duplicate'
     and p_canonical_id not in (p_resource_id, p_candidate_id) then
    raise exception 'Canonical item must belong to the compared pair';
  end if;

  insert into public.knowledge_duplicate_decisions(
    resource_type, resource_id, candidate_id, decision, canonical_id,
    reason, decided_by, request_id
  ) values (
    p_resource_type, p_resource_id, p_candidate_id, p_decision, p_canonical_id,
    trim(p_reason), actor, p_request_id
  )
  on conflict (request_id) do update set request_id = excluded.request_id
  returning id into decision_id;

  insert into public.editorial_audit_events(
    actor_id, actor_role, action, resource_type, resource_id,
    request_id, metadata
  ) values (
    actor, case when public.has_app_role('admin') then 'admin' else 'editor' end,
    'knowledge_duplicate_' || p_decision, p_resource_type, p_resource_id,
    p_request_id::text,
    jsonb_build_object(
      'candidateId', p_candidate_id,
      'canonicalId', p_canonical_id,
      'decisionId', decision_id
    )
  );
  return decision_id;
end;
$$;

revoke all on public.knowledge_duplicate_decisions from anon, authenticated;
grant select on public.knowledge_duplicate_decisions to authenticated;
revoke all on function public.resolve_knowledge_duplicate(
  text,uuid,uuid,text,uuid,text,uuid
) from public, anon;
grant execute on function public.resolve_knowledge_duplicate(
  text,uuid,uuid,text,uuid,text,uuid
) to authenticated;

comment on table public.knowledge_duplicate_decisions is
  'Append-only editorial decisions for deterministic duplicate candidates; library data remains in its canonical domain.';

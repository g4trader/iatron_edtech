create table public.learning_event_types (
  code text primary key check (code ~ '^[A-Z][A-Za-z]+$'),
  name text not null unique,
  description text not null,
  produces_evidence boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.learning_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null references public.learning_event_types(code) on delete restrict,
  occurred_at timestamptz not null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 200),
  schema_version smallint not null default 1 check (schema_version > 0),
  created_at timestamptz not null default now(),
  unique (student_id, idempotency_key)
);
create index learning_events_student_occurred_idx on public.learning_events(student_id, occurred_at desc, id desc);
create index learning_events_type_idx on public.learning_events(event_type);

create table public.learning_evidence (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  source_event_id uuid not null references public.learning_events(id) on delete restrict,
  weight numeric(5,4) not null check (weight > 0 and weight <= 10),
  difficulty smallint not null check (difficulty between 1 and 5),
  response_time_ms integer check (response_time_ms is null or response_time_ms >= 0),
  is_correct boolean not null,
  observed_at timestamptz not null,
  algorithm_version text not null check (char_length(algorithm_version) between 3 and 60),
  created_at timestamptz not null default now(),
  unique (source_event_id, competency_id, algorithm_version)
);
create index learning_evidence_student_competency_idx on public.learning_evidence(student_id, competency_id, observed_at desc);
create index learning_evidence_source_event_idx on public.learning_evidence(source_event_id);

create table public.mastery_snapshots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  source_event_id uuid not null references public.learning_events(id) on delete restrict,
  mastery numeric(6,5) not null check (mastery between 0 and 1),
  confidence numeric(6,5) not null check (confidence between 0 and 1),
  evidence_count integer not null check (evidence_count > 0),
  trend text not null check (trend in ('improving', 'stable', 'declining')),
  last_evidence_at timestamptz not null,
  algorithm_version text not null check (char_length(algorithm_version) between 3 and 60),
  calculated_at timestamptz not null default now(),
  unique (source_event_id, competency_id, algorithm_version)
);
create index mastery_snapshots_student_latest_idx on public.mastery_snapshots(student_id, competency_id, calculated_at desc, id desc);
create index mastery_snapshots_timeline_idx on public.mastery_snapshots(student_id, calculated_at desc);

create view public.current_mastery
with (security_invoker = true)
as
select
  id,
  student_id,
  competency_id,
  source_event_id,
  mastery,
  confidence,
  evidence_count,
  trend,
  last_evidence_at,
  algorithm_version,
  calculated_at
from (
  select snapshots.*,
    row_number() over (
      partition by student_id, competency_id
      order by calculated_at desc, id desc
    ) as row_number
  from public.mastery_snapshots snapshots
) ranked
where row_number = 1;

create or replace function public.prevent_learning_history_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'learning history is append-only' using errcode = '55000';
end;
$$;

create trigger learning_events_immutable before update or delete on public.learning_events for each row execute function public.prevent_learning_history_mutation();
create trigger learning_evidence_immutable before update or delete on public.learning_evidence for each row execute function public.prevent_learning_history_mutation();
create trigger mastery_snapshots_immutable before update or delete on public.mastery_snapshots for each row execute function public.prevent_learning_history_mutation();

create or replace function public.record_learning_event(
  p_student_id uuid,
  p_event_type text,
  p_occurred_at timestamptz,
  p_payload jsonb,
  p_idempotency_key text,
  p_schema_version smallint default 1
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
  v_outcome jsonb;
  v_competency_id uuid;
  v_score numeric;
  v_previous_score numeric;
  v_mastery numeric;
  v_confidence numeric;
  v_count integer;
  v_last_at timestamptz;
  v_trend text;
  v_algorithm constant text := 'mastery-v1';
begin
  insert into public.learning_events (
    student_id, event_type, occurred_at, payload, idempotency_key, schema_version
  ) values (
    p_student_id, p_event_type, p_occurred_at, coalesce(p_payload, '{}'::jsonb), p_idempotency_key, p_schema_version
  )
  on conflict (student_id, idempotency_key) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select id into v_event_id
    from public.learning_events
    where student_id = p_student_id and idempotency_key = p_idempotency_key;
    return v_event_id;
  end if;

  if p_event_type = 'QuestionAnswered' then
    if jsonb_typeof(p_payload -> 'competencyOutcomes') is distinct from 'array' then
      raise exception 'QuestionAnswered requires competencyOutcomes array' using errcode = '22023';
    end if;

    for v_outcome in select value from jsonb_array_elements(p_payload -> 'competencyOutcomes') loop
      v_competency_id := (v_outcome ->> 'competencyId')::uuid;
      insert into public.learning_evidence (
        student_id,
        competency_id,
        source_event_id,
        weight,
        difficulty,
        response_time_ms,
        is_correct,
        observed_at,
        algorithm_version
      ) values (
        p_student_id,
        v_competency_id,
        v_event_id,
        coalesce((v_outcome ->> 'weight')::numeric, 1),
        coalesce((v_outcome ->> 'difficulty')::smallint, 3),
        (v_outcome ->> 'responseTimeMs')::integer,
        (v_outcome ->> 'isCorrect')::boolean,
        p_occurred_at,
        'evidence-v1'
      );

      select
        round(sum((case when is_correct then 1 else 0 end) * weight * (0.75 + difficulty * 0.05)) / sum(weight * (0.75 + difficulty * 0.05)), 5),
        least(1, count(*)::numeric / 5),
        count(*)::integer,
        max(observed_at)
      into v_mastery, v_confidence, v_count, v_last_at
      from public.learning_evidence
      where student_id = p_student_id and competency_id = v_competency_id;

      select case when is_correct then 1 else 0 end
      into v_score
      from public.learning_evidence
      where student_id = p_student_id and competency_id = v_competency_id
      order by observed_at desc, id desc
      limit 1;

      select avg(case when is_correct then 1 else 0 end)
      into v_previous_score
      from (
        select is_correct
        from public.learning_evidence
        where student_id = p_student_id and competency_id = v_competency_id
        order by observed_at desc, id desc
        offset 1 limit 4
      ) previous;

      v_trend := case
        when v_previous_score is null or abs(v_score - v_previous_score) < 0.15 then 'stable'
        when v_score > v_previous_score then 'improving'
        else 'declining'
      end;

      insert into public.mastery_snapshots (
        student_id, competency_id, source_event_id, mastery, confidence,
        evidence_count, trend, last_evidence_at, algorithm_version
      ) values (
        p_student_id, v_competency_id, v_event_id, v_mastery, v_confidence,
        v_count, v_trend, v_last_at, v_algorithm
      );
    end loop;
  end if;

  return v_event_id;
end;
$$;

alter table public.learning_event_types enable row level security;
alter table public.learning_events enable row level security;
alter table public.learning_evidence enable row level security;
alter table public.mastery_snapshots enable row level security;

create policy learning_event_types_read_authenticated on public.learning_event_types for select to authenticated using (true);
create policy learning_events_read_own on public.learning_events for select to authenticated using ((select auth.uid()) = student_id);
create policy learning_evidence_read_own on public.learning_evidence for select to authenticated using ((select auth.uid()) = student_id);
create policy mastery_snapshots_read_own on public.mastery_snapshots for select to authenticated using ((select auth.uid()) = student_id);

revoke all on public.learning_event_types, public.learning_events, public.learning_evidence, public.mastery_snapshots from anon, authenticated;
grant select on public.learning_event_types to authenticated;
grant select on public.learning_events, public.learning_evidence, public.mastery_snapshots to authenticated;
grant select on public.current_mastery to authenticated;
revoke all on function public.record_learning_event(uuid, text, timestamptz, jsonb, text, smallint) from public, anon, authenticated;
grant execute on function public.record_learning_event(uuid, text, timestamptz, jsonb, text, smallint) to service_role;

comment on table public.learning_events is 'Append-only primary source of truth for student learning interactions.';
comment on table public.learning_evidence is 'Explainable competency evidence derived from a source event.';
comment on table public.mastery_snapshots is 'Append-only deterministic mastery timeline; never a primary fact.';

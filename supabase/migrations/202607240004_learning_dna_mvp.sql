create table public.learning_dna_policies (
  version text primary key check (char_length(version) between 3 and 80),
  algorithm_version text not null check (char_length(algorithm_version) between 3 and 80),
  parameters jsonb not null check (jsonb_typeof(parameters) = 'object'),
  is_active boolean not null default false,
  is_synthetic boolean not null default true,
  limitations text[] not null default '{}',
  created_at timestamptz not null default now()
);

create unique index learning_dna_policies_one_active_idx
  on public.learning_dna_policies(is_active) where is_active;

insert into public.learning_dna_policies(
  version, algorithm_version, parameters, is_active, is_synthetic, limitations
) values (
  'learning-dna-policy-v1-synthetic',
  'learning-dna-v1',
  jsonb_build_object(
    'minimumComparableEvents', 4,
    'minimumTimedEvents', 3,
    'minimumCalibrationEvents', 4,
    'recurringErrorCount', 2,
    'retentionIntervalDays', 7,
    'speedTolerance', 0.2,
    'consistencyVariation', 0.25
  ),
  true,
  true,
  array['Parâmetros sintéticos pendentes de validação pedagógica e estatística.']
);

create table public.learning_dna_snapshots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  scope_type text not null check (scope_type in ('global', 'area', 'competency')),
  scope_id uuid,
  window_start timestamptz,
  window_end timestamptz,
  calculated_at timestamptz not null default now(),
  algorithm_version text not null check (char_length(algorithm_version) between 3 and 80),
  policy_version text not null references public.learning_dna_policies(version) on delete restrict,
  evidence_count integer not null check (evidence_count >= 0),
  coverage numeric(6,5) not null check (coverage between 0 and 1),
  indicators jsonb not null check (jsonb_typeof(indicators) = 'array'),
  limitations text[] not null default '{}',
  sufficiency text not null check (sufficiency in ('sufficient', 'partial', 'insufficient')),
  event_origins text[] not null default '{}',
  source_hash text not null check (source_hash ~ '^[a-f0-9]{32}$'),
  check (
    (scope_type = 'global' and scope_id is null)
    or (scope_type in ('area', 'competency') and scope_id is not null)
  ),
  check (window_end is null or window_start is null or window_end >= window_start),
  unique nulls not distinct (
    student_id, scope_type, scope_id, policy_version, source_hash
  )
);
create index learning_dna_snapshots_student_latest_idx
  on public.learning_dna_snapshots(student_id, calculated_at desc, id desc);
create index learning_dna_snapshots_student_scope_idx
  on public.learning_dna_snapshots(student_id, scope_type, scope_id, calculated_at desc);

create trigger learning_dna_snapshots_immutable
before update or delete on public.learning_dna_snapshots
for each row execute function public.prevent_learning_history_mutation();

create or replace function public.learning_dna_indicator_json(
  p_type text,
  p_state text,
  p_event_count integer,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_competency_ids uuid[],
  p_area_ids uuid[],
  p_sufficient boolean,
  p_rule text,
  p_limitations text[],
  p_message text
) returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'type', p_type,
    'state', p_state,
    'eventCount', p_event_count,
    'periodStart', p_period_start,
    'periodEnd', p_period_end,
    'competencyIds', coalesce(to_jsonb(p_competency_ids), '[]'::jsonb),
    'areaIds', coalesce(to_jsonb(p_area_ids), '[]'::jsonb),
    'sufficient', p_sufficient,
    'rule', p_rule,
    'limitations', coalesce(to_jsonb(p_limitations), '[]'::jsonb),
    'algorithmVersion', 'learning-dna-v1',
    'message', p_message
  );
$$;

create or replace function public.capture_learning_dna_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_start timestamptz;
  v_end timestamptz;
  v_correct numeric;
  v_variation numeric;
  v_timed integer;
  v_declared integer;
  v_certain_errors integer;
  v_uncertain_correct integer;
  v_max_errors integer;
  v_competencies uuid[];
  v_areas uuid[];
  v_origins text[];
  v_hash text;
  v_consistency text;
  v_calibration text;
  v_recurrence text;
  v_limitations text[] := array[
    'Parâmetros sintéticos pendentes de validação pedagógica e estatística.'
  ];
begin
  select
    count(distinct qa.id)::integer,
    min(qa.answered_at),
    max(qa.answered_at),
    avg(qa.is_correct::integer),
    stddev_pop(qa.is_correct::integer),
    count(distinct qa.id) filter (
      where qa.response_time_ms between 1000 and 900000
    )::integer,
    count(distinct qa.id) filter (where qa.stated_confidence is not null)::integer,
    count(distinct qa.id) filter (
      where not qa.is_correct and qa.stated_confidence in ('certain', 'high')
    )::integer,
    count(distinct qa.id) filter (
      where qa.is_correct
        and qa.stated_confidence in ('uncertain', 'do_not_know', 'low', 'medium')
    )::integer,
    array_agg(distinct qvc.competency_id order by qvc.competency_id),
    array_agg(distinct qvs.specialty_id order by qvs.specialty_id)
      filter (where qvs.specialty_id is not null),
    array_agg(distinct qa.origin order by qa.origin),
    md5(string_agg(distinct qa.id::text, ',' order by qa.id::text))
  into
    v_count, v_start, v_end, v_correct, v_variation, v_timed, v_declared,
    v_certain_errors, v_uncertain_correct, v_competencies, v_areas,
    v_origins, v_hash
  from public.question_attempts qa
  join public.question_version_competencies qvc
    on qvc.question_version_id = qa.question_version_id
  left join public.question_version_specialties qvs
    on qvs.question_version_id = qa.question_version_id
  where qa.student_id = new.student_id;

  select coalesce(max(error_count), 0)
  into v_max_errors
  from (
    select qvc.competency_id, count(*)::integer as error_count
    from public.question_attempts qa
    join public.question_version_competencies qvc
      on qvc.question_version_id = qa.question_version_id
    where qa.student_id = new.student_id and not qa.is_correct
    group by qvc.competency_id
  ) errors;

  v_consistency := case
    when v_count < 4 then 'insufficient_evidence'
    when coalesce(v_variation, 0) <= 0.25 then 'stable'
    else 'variable'
  end;
  v_calibration := case
    when v_declared < 4 then 'insufficient_evidence'
    when v_certain_errors >= 2 then 'possible_overconfidence'
    when v_uncertain_correct >= 2 then 'possible_underconfidence'
    else 'well_calibrated'
  end;
  v_recurrence := case
    when v_count < 2 then 'insufficient_evidence'
    when v_max_errors >= 2 then 'recurring_gap'
    when v_max_errors = 1 then 'isolated_error'
    else 'insufficient_evidence'
  end;

  insert into public.learning_dna_snapshots(
    student_id, scope_type, scope_id, window_start, window_end,
    algorithm_version, policy_version, evidence_count, coverage,
    indicators, limitations, sufficiency, event_origins, source_hash
  ) values (
    new.student_id, 'global', null, v_start, v_end,
    'learning-dna-v1', 'learning-dna-policy-v1-synthetic', v_count,
    least(1, coalesce(cardinality(v_areas), 0)::numeric / 5),
    jsonb_build_array(
      public.learning_dna_indicator_json(
        'consistency', v_consistency, v_count, v_start, v_end,
        v_competencies, v_areas, v_consistency <> 'insufficient_evidence',
        'minimum=4;variation<=0.25', v_limitations,
        case when v_consistency = 'stable'
          then 'Seu desempenho tem se mantido estável nas últimas atividades.'
          when v_consistency = 'variable'
          then 'Seu desempenho variou nas atividades recentes. Vamos observar novas respostas.'
          else 'Ainda não há atividades suficientes para identificar um padrão confiável.' end
      ),
      public.learning_dna_indicator_json(
        'observed_speed', 'insufficient_evidence', v_timed, v_start, v_end,
        v_competencies, v_areas, false, 'own_baseline;minimum=3',
        v_limitations || 'O snapshot persistido requer comparação detalhada sob demanda.',
        'Ainda não há atividades suficientes para identificar um padrão confiável.'
      ),
      public.learning_dna_indicator_json(
        'calibrated_safety', v_calibration, v_declared, v_start, v_end,
        v_competencies, v_areas, v_calibration <> 'insufficient_evidence',
        'minimum=4;repeated_mismatch=2', v_limitations,
        case when v_calibration = 'possible_overconfidence'
          then 'Em algumas respostas, sua confiança foi maior do que o resultado observado.'
          when v_calibration = 'possible_underconfidence'
          then 'Em algumas respostas corretas, você demonstrou pouca segurança.'
          when v_calibration = 'well_calibrated'
          then 'Sua segurança declarada tem acompanhado os resultados observados.'
          else 'Ainda não há atividades suficientes para identificar um padrão confiável.' end
      ),
      public.learning_dna_indicator_json(
        'recurring_error', v_recurrence, v_count, v_start, v_end,
        v_competencies, v_areas, v_recurrence <> 'insufficient_evidence',
        'same_competency_errors>=2', v_limitations,
        case when v_recurrence = 'recurring_gap'
          then 'O mesmo conteúdo apareceu em mais de um erro recente.'
          when v_recurrence = 'isolated_error'
          then 'Há um erro isolado; ainda não existe repetição suficiente.'
          else 'Ainda não há atividades suficientes para identificar um padrão confiável.' end
      ),
      public.learning_dna_indicator_json(
        'retention', 'insufficient_evidence', v_count, v_start, v_end,
        v_competencies, v_areas, false, 'comparable_interval_days>=7',
        v_limitations, 'Ainda não há atividades suficientes para identificar um padrão confiável.'
      ),
      public.learning_dna_indicator_json(
        'review_response', 'insufficient_evidence', v_count, v_start, v_end,
        v_competencies, v_areas, false, 'attempt_before_and_after_review',
        v_limitations, 'Ainda não há atividades suficientes para identificar um padrão confiável.'
      ),
      public.learning_dna_indicator_json(
        'knowledge_stability', v_consistency, v_count, v_start, v_end,
        v_competencies, v_areas, v_consistency <> 'insufficient_evidence',
        'consistency_and_retention', v_limitations,
        case when v_consistency = 'stable'
          then 'O conhecimento observado permaneceu estável nesta janela.'
          when v_consistency = 'variable'
          then 'O conhecimento observado variou nesta janela.'
          else 'Ainda não há atividades suficientes para identificar um padrão confiável.' end
      )
    ),
    v_limitations,
    case
      when v_count >= 7 then 'sufficient'
      when v_count >= 4 then 'partial'
      else 'insufficient'
    end,
    coalesce(v_origins, '{}'),
    v_hash
  )
  on conflict do nothing;
  return new;
end;
$$;

create trigger question_attempts_capture_learning_dna
after insert on public.question_attempts
for each row execute function public.capture_learning_dna_snapshot();

alter table public.learning_dna_policies enable row level security;
alter table public.learning_dna_snapshots enable row level security;
revoke all on public.learning_dna_policies from anon, authenticated;
revoke all on public.learning_dna_snapshots from anon, authenticated;
grant select on public.learning_dna_policies, public.learning_dna_snapshots
  to authenticated;

create policy learning_dna_policies_read
on public.learning_dna_policies for select to authenticated using (true);
create policy learning_dna_snapshots_read_own
on public.learning_dna_snapshots for select to authenticated
using (student_id = (select auth.uid()));

revoke all on function public.learning_dna_indicator_json(
  text, text, integer, timestamptz, timestamptz, uuid[], uuid[],
  boolean, text, text[], text
) from public, anon, authenticated;
revoke all on function public.capture_learning_dna_snapshot()
  from public, anon, authenticated;

alter table public.question_attempts
  alter column stated_confidence drop not null,
  drop constraint question_attempts_stated_confidence_check,
  add constraint question_attempts_stated_confidence_check check (
    stated_confidence is null or stated_confidence in (
      'low', 'medium', 'high', 'certain', 'uncertain', 'do_not_know'
    )
  ),
  add column evidence_signal text check (
    evidence_signal is null or evidence_signal in (
      'evidence_of_consolidation', 'explicit_gap', 'uncertain_knowledge',
      'possible_miscalibration', 'insufficient_evidence'
    )
  ),
  add column evidence_algorithm_version text;

alter table public.diagnostic_assessments
  add column policy_version text not null default 'diagnostic-policy-v2-synthetic';

alter table public.assessment_results
  add column completion_reason text check (
    completion_reason is null or completion_reason in (
      'coverage_complete', 'question_budget_reached', 'duration_reached',
      'content_exhausted', 'insufficient_evidence'
    )
  ),
  add column evidence_sufficient boolean not null default false;

create table public.assessment_result_areas (
  assessment_result_id uuid not null references public.assessment_results(id) on delete cascade,
  area_id uuid not null references public.specialties(id) on delete restrict,
  observed_level text not null check (
    observed_level in (
      'consolidating', 'developing', 'needs_attention', 'insufficient_evidence'
    )
  ),
  evidence_count integer not null check (evidence_count >= 0),
  evidence_quality text not null check (evidence_quality in ('low', 'medium', 'high')),
  calibrated_safety text not null check (
    calibrated_safety in (
      'calibrated', 'uncertain', 'possible_miscalibration', 'insufficient_evidence'
    )
  ),
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  uncertainties text[] not null default '{}',
  target_exam_influence text not null,
  recommended_next_step text not null,
  primary key (assessment_result_id, area_id)
);
create index assessment_result_areas_area_idx
  on public.assessment_result_areas(area_id);

create trigger assessment_result_areas_immutable
before update or delete on public.assessment_result_areas
for each row execute function public.prevent_learning_history_mutation();

alter table public.assessment_result_areas enable row level security;
revoke all on public.assessment_result_areas from anon, authenticated;
grant select on public.assessment_result_areas to authenticated;
create policy assessment_result_areas_read_own
on public.assessment_result_areas for select to authenticated
using (
  exists (
    select 1 from public.assessment_results r
    where r.id = assessment_result_id
      and r.student_id = (select auth.uid())
  )
);

create or replace function public.answer_diagnostic_question(
  p_assessment_id uuid,
  p_question_version_id uuid,
  p_selected_option_id uuid,
  p_response_time_ms integer,
  p_stated_confidence text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_correct boolean;
  v_attempt uuid;
  v_event uuid;
  v_payload jsonb;
  v_signal text := 'insufficient_evidence';
  v_prior_certain_errors integer := 0;
begin
  if not exists (
    select 1 from public.diagnostic_assessments
    where id = p_assessment_id and student_id = v_student and status = 'active'
  ) then
    raise exception 'active assessment not found' using errcode = '42501';
  end if;
  if p_stated_confidence is not null and p_stated_confidence not in (
    'low', 'medium', 'high', 'certain', 'uncertain', 'do_not_know'
  ) then
    raise exception 'invalid stated confidence' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.assessment_question_selections
    where assessment_id = p_assessment_id
      and question_version_id = p_question_version_id
  ) then
    raise exception 'question was not selected' using errcode = '22023';
  end if;

  select is_correct into v_correct
  from public.question_options
  where id = p_selected_option_id
    and question_version_id = p_question_version_id;
  if v_correct is null then
    raise exception 'invalid option' using errcode = '22023';
  end if;

  select count(*) into v_prior_certain_errors
  from public.question_attempts
  where assessment_id = p_assessment_id
    and is_correct = false
    and stated_confidence in ('certain', 'high');

  if v_correct and p_stated_confidence in ('certain', 'high') then
    v_signal := 'evidence_of_consolidation';
  elsif not v_correct and p_stated_confidence = 'do_not_know' then
    v_signal := 'explicit_gap';
  elsif v_correct and p_stated_confidence in ('uncertain', 'do_not_know', 'low', 'medium') then
    v_signal := 'uncertain_knowledge';
  elsif not v_correct and p_stated_confidence in ('certain', 'high')
    and v_prior_certain_errors > 0 then
    v_signal := 'possible_miscalibration';
  end if;

  select jsonb_build_object(
    'assessmentId', p_assessment_id,
    'questionVersionId', p_question_version_id,
    'declaredSafety', p_stated_confidence,
    'evidenceSignal', v_signal,
    'algorithmVersion', 'diagnostic-evidence-v2',
    'examProgramId', da.exam_program_id,
    'largeAreaIds', (
      select coalesce(
        jsonb_agg(qvs.specialty_id order by qvs.specialty_id),
        '[]'::jsonb
      )
      from public.question_version_specialties qvs
      where qvs.question_version_id = qv.id
    ),
    'competencyOutcomes', jsonb_agg(jsonb_build_object(
      'competencyId', qvc.competency_id,
      'weight', qvc.relevance,
      'difficulty', coalesce(qv.difficulty, 3),
      'responseTimeMs', p_response_time_ms,
      'isCorrect', v_correct
    ))
  ) into v_payload
  from public.question_versions qv
  join public.question_version_competencies qvc
    on qvc.question_version_id = qv.id
  join public.diagnostic_assessments da on da.id = p_assessment_id
  where qv.id = p_question_version_id
  group by qv.id, da.exam_program_id;
  if v_payload is null then
    raise exception 'question has no competency' using errcode = '22023';
  end if;

  v_event := public.record_learning_event(
    v_student, 'QuestionAnswered', now(), v_payload,
    'assessment:' || p_assessment_id || ':question:' || p_question_version_id,
    2::smallint
  );
  insert into public.question_attempts(
    assessment_id, question_version_id, student_id, selected_option_id,
    is_correct, response_time_ms, stated_confidence, evidence_signal,
    evidence_algorithm_version, learning_event_id
  ) values (
    p_assessment_id, p_question_version_id, v_student, p_selected_option_id,
    v_correct, p_response_time_ms, p_stated_confidence, v_signal,
    'diagnostic-evidence-v2', v_event
  ) returning id into v_attempt;
  return v_attempt;
end;
$$;

create or replace function public.finish_diagnostic_assessment_v2(
  p_assessment_id uuid,
  p_completion_reason text,
  p_evidence_sufficient boolean
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_result uuid;
  v_answered integer;
  v_correct integer;
  v_total integer;
  v_measured integer;
  v_conf numeric;
  v_coverage numeric;
begin
  if p_completion_reason not in (
    'coverage_complete', 'question_budget_reached', 'duration_reached',
    'content_exhausted', 'insufficient_evidence'
  ) then
    raise exception 'invalid completion reason' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.diagnostic_assessments
    where id = p_assessment_id and student_id = v_student and status = 'active'
  ) then
    raise exception 'active assessment not found' using errcode = '42501';
  end if;

  select count(*), count(*) filter (where is_correct)
  into v_answered, v_correct
  from public.question_attempts where assessment_id = p_assessment_id;
  if v_answered = 0 then
    raise exception 'assessment has no evidence' using errcode = '22023';
  end if;

  select count(*) into v_total
  from public.assessment_competencies where assessment_id = p_assessment_id;
  select
    count(*) filter (where coalesce(cm.evidence_count, 0) > 0),
    coalesce(avg(public.calculate_diagnostic_confidence(
      v_student, ac.competency_id, now()
    )), 0)
  into v_measured, v_conf
  from public.assessment_competencies ac
  left join public.current_mastery cm
    on cm.student_id = v_student and cm.competency_id = ac.competency_id
  where ac.assessment_id = p_assessment_id;
  v_coverage := case when v_total = 0 then 0 else v_measured::numeric / v_total end;

  update public.diagnostic_assessments set
    status = 'completed', completed_at = now(),
    overall_confidence = v_conf, diagnostic_coverage = v_coverage
  where id = p_assessment_id;

  insert into public.assessment_results(
    assessment_id, student_id, correct_count, answered_count,
    overall_confidence, diagnostic_coverage, algorithm_version,
    completion_reason, evidence_sufficient
  ) values (
    p_assessment_id, v_student, v_correct, v_answered,
    v_conf, v_coverage, 'assessment-v2',
    p_completion_reason, p_evidence_sufficient
  ) returning id into v_result;

  insert into public.assessment_result_competencies(
    assessment_result_id, competency_id, mastery, confidence,
    confidence_level, evidence_count, classification
  )
  select
    v_result, ac.competency_id, coalesce(cm.mastery, 0),
    public.calculate_diagnostic_confidence(v_student, ac.competency_id, now()),
    case
      when public.calculate_diagnostic_confidence(v_student, ac.competency_id, now()) >= 0.7 then 'high'
      when public.calculate_diagnostic_confidence(v_student, ac.competency_id, now()) >= 0.4 then 'medium'
      else 'low'
    end,
    coalesce(cm.evidence_count, 0),
    case
      when coalesce(cm.evidence_count, 0) = 0 then 'unmeasured'
      when cm.mastery >= 0.75 then 'strong'
      when cm.mastery < 0.5 then 'weak'
      else 'developing'
    end
  from public.assessment_competencies ac
  left join public.current_mastery cm
    on cm.student_id = v_student and cm.competency_id = ac.competency_id
  where ac.assessment_id = p_assessment_id;

  insert into public.assessment_result_areas(
    assessment_result_id, area_id, observed_level, evidence_count,
    evidence_quality, calibrated_safety, strengths, weaknesses,
    uncertainties, target_exam_influence, recommended_next_step
  )
  select
    v_result,
    a.id,
    case
      when count(qa.id) = 0 then 'insufficient_evidence'
      when avg(qa.is_correct::integer) >= 0.75 then 'consolidating'
      when avg(qa.is_correct::integer) < 0.5 then 'needs_attention'
      else 'developing'
    end,
    count(qa.id),
    case when count(qa.id) >= 3 then 'high' when count(qa.id) >= 2 then 'medium' else 'low' end,
    case
      when count(qa.id) = 0 then 'insufficient_evidence'
      when count(*) filter (where qa.evidence_signal = 'possible_miscalibration') > 0
        then 'possible_miscalibration'
      when count(*) filter (where qa.stated_confidence is null) > 0 then 'uncertain'
      else 'calibrated'
    end,
    case when count(*) filter (where qa.evidence_signal = 'evidence_of_consolidation') > 0
      then array['Há respostas recentes que sustentam consolidação nesta área.'] else '{}' end,
    case when count(*) filter (where qa.evidence_signal = 'explicit_gap') > 0
      then array['Há conteúdo que merece revisão dirigida.'] else '{}' end,
    case when count(qa.id) = 0 or count(*) filter (
      where qa.evidence_signal in ('uncertain_knowledge', 'insufficient_evidence')
    ) > 0 then array['Ainda precisamos de mais respostas para concluir com segurança.'] else '{}' end,
    case when exists (
      select 1
      from public.diagnostic_assessments da
      join public.exam_intelligence_profiles ep
        on ep.exam_program_id = da.exam_program_id and ep.is_active
      where da.id = p_assessment_id
    ) then 'O perfil sintético da prova foi usado apenas como critério complementar.'
    else 'Nenhum perfil de banca compatível influenciou este resultado.' end,
    case
      when count(qa.id) = 0 then 'Responder questões desta área em uma próxima sessão.'
      when avg(qa.is_correct::integer) < 0.5 then 'Revisar os fundamentos e praticar novamente.'
      else 'Continuar praticando para confirmar este resultado.'
    end
  from public.specialties a
  left join public.question_version_specialties qvt on qvt.specialty_id = a.id
  left join public.question_attempts qa
    on qa.question_version_id = qvt.question_version_id
    and qa.assessment_id = p_assessment_id
  group by a.id;

  perform public.record_learning_event(
    v_student, 'AssessmentFinished', now(),
    jsonb_build_object(
      'assessmentId', p_assessment_id, 'answered', v_answered,
      'correct', v_correct, 'coverage', v_coverage,
      'completionReason', p_completion_reason,
      'evidenceSufficient', p_evidence_sufficient,
      'algorithmVersion', 'assessment-v2'
    ),
    'assessment:' || p_assessment_id || ':finished', 2::smallint
  );
  return v_result;
end;
$$;

revoke all on function public.finish_diagnostic_assessment_v2(uuid, text, boolean)
  from public, anon;
grant execute on function public.finish_diagnostic_assessment_v2(uuid, text, boolean)
  to authenticated;

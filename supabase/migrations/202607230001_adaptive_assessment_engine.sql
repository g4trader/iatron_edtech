create table public.assessment_statuses (
  code text primary key check (code ~ '^[a-z_]+$'),
  name text not null unique
);
insert into public.assessment_statuses (code, name) values
  ('active', 'Em andamento'), ('completed', 'Concluída'), ('cancelled', 'Cancelada');

create table public.diagnostic_assessments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  objective text not null check (char_length(objective) between 3 and 300),
  exam_program_id uuid references public.exam_programs(id) on delete restrict,
  specialty_id uuid references public.specialties(id) on delete restrict,
  status text not null default 'active' references public.assessment_statuses(code),
  algorithm text not null default 'deterministic-adaptive',
  algorithm_version text not null default 'assessment-v1',
  duration_minutes smallint not null check (duration_minutes between 5 and 360),
  question_count smallint not null check (question_count between 1 and 100),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  overall_confidence numeric(6,5) check (overall_confidence between 0 and 1),
  diagnostic_coverage numeric(6,5) check (diagnostic_coverage between 0 and 1),
  created_at timestamptz not null default now(),
  check ((status = 'completed') = (completed_at is not null))
);
create index diagnostic_assessments_student_started_idx on public.diagnostic_assessments(student_id, started_at desc);
create index diagnostic_assessments_program_idx on public.diagnostic_assessments(exam_program_id);
create index diagnostic_assessments_specialty_idx on public.diagnostic_assessments(specialty_id);

create table public.assessment_competencies (
  assessment_id uuid not null references public.diagnostic_assessments(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  primary key (assessment_id, competency_id)
);
create index assessment_competencies_competency_idx on public.assessment_competencies(competency_id);

create table public.assessment_question_selections (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.diagnostic_assessments(id) on delete cascade,
  question_version_id uuid not null references public.question_versions(id) on delete restrict,
  selection_order smallint not null check (selection_order > 0),
  rationale jsonb not null check (jsonb_typeof(rationale) = 'object'),
  selected_at timestamptz not null default now(),
  unique (assessment_id, question_version_id),
  unique (assessment_id, selection_order)
);
create index assessment_question_selections_question_idx on public.assessment_question_selections(question_version_id);

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.diagnostic_assessments(id) on delete cascade,
  question_version_id uuid not null references public.question_versions(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete cascade,
  selected_option_id uuid not null references public.question_options(id) on delete restrict,
  is_correct boolean not null,
  response_time_ms integer not null check (response_time_ms between 0 and 7200000),
  stated_confidence text not null check (stated_confidence in ('low', 'medium', 'high')),
  origin text not null default 'diagnostic' check (char_length(origin) between 3 and 40),
  learning_event_id uuid not null references public.learning_events(id) on delete restrict,
  answered_at timestamptz not null default now(),
  unique (assessment_id, question_version_id)
);
create index question_attempts_student_answered_idx on public.question_attempts(student_id, answered_at desc);
create index question_attempts_assessment_idx on public.question_attempts(assessment_id, answered_at);
create index question_attempts_question_idx on public.question_attempts(question_version_id);

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.diagnostic_assessments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  correct_count smallint not null check (correct_count >= 0),
  answered_count smallint not null check (answered_count >= 0),
  overall_confidence numeric(6,5) not null check (overall_confidence between 0 and 1),
  diagnostic_coverage numeric(6,5) not null check (diagnostic_coverage between 0 and 1),
  algorithm_version text not null,
  created_at timestamptz not null default now(),
  check (correct_count <= answered_count)
);
create index assessment_results_student_created_idx on public.assessment_results(student_id, created_at desc);

create table public.assessment_result_competencies (
  assessment_result_id uuid not null references public.assessment_results(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  mastery numeric(6,5) not null check (mastery between 0 and 1),
  confidence numeric(6,5) not null check (confidence between 0 and 1),
  confidence_level text not null check (confidence_level in ('low', 'medium', 'high')),
  evidence_count integer not null check (evidence_count >= 0),
  classification text not null check (classification in ('strong', 'weak', 'unmeasured', 'developing')),
  primary key (assessment_result_id, competency_id)
);
create index assessment_result_competencies_competency_idx on public.assessment_result_competencies(competency_id);

create trigger question_attempts_immutable before update or delete on public.question_attempts for each row execute function public.prevent_learning_history_mutation();
create trigger assessment_results_immutable before update or delete on public.assessment_results for each row execute function public.prevent_learning_history_mutation();
create trigger assessment_result_competencies_immutable before update or delete on public.assessment_result_competencies for each row execute function public.prevent_learning_history_mutation();

create or replace function public.start_diagnostic_assessment(
  p_objective text, p_exam_program_id uuid, p_specialty_id uuid,
  p_duration_minutes smallint, p_question_count smallint, p_competency_ids uuid[]
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_student uuid := auth.uid(); v_id uuid;
begin
  if v_student is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if coalesce(array_length(p_competency_ids, 1), 0) = 0 then raise exception 'competencies required' using errcode = '22023'; end if;
  insert into public.diagnostic_assessments(student_id, objective, exam_program_id, specialty_id, duration_minutes, question_count)
  values(v_student, p_objective, p_exam_program_id, p_specialty_id, p_duration_minutes, p_question_count) returning id into v_id;
  insert into public.assessment_competencies(assessment_id, competency_id)
  select v_id, competency_id from unnest(p_competency_ids) competency_id on conflict do nothing;
  return v_id;
end; $$;

create or replace function public.select_assessment_question(
  p_assessment_id uuid, p_question_version_id uuid, p_selection_order smallint, p_rationale jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not exists(select 1 from public.diagnostic_assessments where id=p_assessment_id and student_id=auth.uid() and status='active') then raise exception 'active assessment not found' using errcode='42501'; end if;
  insert into public.assessment_question_selections(assessment_id, question_version_id, selection_order, rationale)
  values(p_assessment_id, p_question_version_id, p_selection_order, p_rationale)
  on conflict (assessment_id, question_version_id) do update set rationale=public.assessment_question_selections.rationale
  returning id into v_id;
  return v_id;
end; $$;

create or replace function public.answer_diagnostic_question(
  p_assessment_id uuid, p_question_version_id uuid, p_selected_option_id uuid,
  p_response_time_ms integer, p_stated_confidence text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_student uuid := auth.uid(); v_correct boolean; v_attempt uuid; v_event uuid; v_payload jsonb;
begin
  if not exists(select 1 from public.diagnostic_assessments where id=p_assessment_id and student_id=v_student and status='active') then raise exception 'active assessment not found' using errcode='42501'; end if;
  if not exists(select 1 from public.assessment_question_selections where assessment_id=p_assessment_id and question_version_id=p_question_version_id) then raise exception 'question was not selected' using errcode='22023'; end if;
  select is_correct into v_correct from public.question_options where id=p_selected_option_id and question_version_id=p_question_version_id;
  if v_correct is null then raise exception 'invalid option' using errcode='22023'; end if;
  select jsonb_build_object('assessmentId', p_assessment_id, 'questionVersionId', p_question_version_id, 'competencyOutcomes', jsonb_agg(jsonb_build_object(
    'competencyId', qvc.competency_id, 'weight', qvc.relevance, 'difficulty', coalesce(qv.difficulty,3),
    'responseTimeMs', p_response_time_ms, 'isCorrect', v_correct
  ))) into v_payload
  from public.question_versions qv join public.question_version_competencies qvc on qvc.question_version_id=qv.id where qv.id=p_question_version_id group by qv.id;
  if v_payload is null then raise exception 'question has no competency' using errcode='22023'; end if;
  v_event := public.record_learning_event(v_student, 'QuestionAnswered', now(), v_payload, 'assessment:'||p_assessment_id||':question:'||p_question_version_id, 1::smallint);
  insert into public.question_attempts(assessment_id, question_version_id, student_id, selected_option_id, is_correct, response_time_ms, stated_confidence, learning_event_id)
  values(p_assessment_id, p_question_version_id, v_student, p_selected_option_id, v_correct, p_response_time_ms, p_stated_confidence, v_event)
  returning id into v_attempt;
  return v_attempt;
end; $$;

create or replace function public.calculate_diagnostic_confidence(p_student_id uuid, p_competency_id uuid, p_as_of timestamptz)
returns numeric language sql stable set search_path = '' as $$
  with facts as (
    select (case when e.is_correct then 1 else 0 end)::numeric as score, e.observed_at, qa.question_version_id
    from public.learning_evidence e
    left join public.question_attempts qa on qa.learning_event_id=e.source_event_id
    where e.student_id=p_student_id and e.competency_id=p_competency_id
  ), summary as (
    select count(*)::numeric n, max(observed_at) last_at, avg(score) mean_score,
      count(distinct question_version_id)::numeric distinct_questions
    from facts
  )
  select round(least(1,n/5)*0.4 +
    case when last_at is null then 0 else greatest(0,1-extract(epoch from (p_as_of-last_at))/7776000)*0.2 end +
    case when n<2 then 0 else (1-(select avg(abs(score-mean_score)) from facts))*0.2 end +
    least(1,distinct_questions/3)*0.2,5) from summary;
$$;

create or replace function public.finish_diagnostic_assessment(p_assessment_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_student uuid:=auth.uid(); v_result uuid; v_answered integer; v_correct integer; v_total integer; v_measured integer; v_conf numeric; v_coverage numeric;
begin
  if not exists(select 1 from public.diagnostic_assessments where id=p_assessment_id and student_id=v_student and status='active') then raise exception 'active assessment not found' using errcode='42501'; end if;
  select count(*), count(*) filter(where is_correct) into v_answered,v_correct from public.question_attempts where assessment_id=p_assessment_id;
  select count(*) into v_total from public.assessment_competencies where assessment_id=p_assessment_id;
  select count(*) filter(where coalesce(cm.evidence_count,0)>0), coalesce(avg(public.calculate_diagnostic_confidence(v_student,ac.competency_id,now())),0)
  into v_measured,v_conf from public.assessment_competencies ac left join public.current_mastery cm on cm.student_id=v_student and cm.competency_id=ac.competency_id where ac.assessment_id=p_assessment_id;
  v_coverage := case when v_total=0 then 0 else v_measured::numeric/v_total end;
  update public.diagnostic_assessments set status='completed', completed_at=now(), overall_confidence=v_conf, diagnostic_coverage=v_coverage where id=p_assessment_id;
  insert into public.assessment_results(assessment_id,student_id,correct_count,answered_count,overall_confidence,diagnostic_coverage,algorithm_version)
  values(p_assessment_id,v_student,v_correct,v_answered,v_conf,v_coverage,'assessment-v1') returning id into v_result;
  insert into public.assessment_result_competencies(assessment_result_id,competency_id,mastery,confidence,confidence_level,evidence_count,classification)
  select v_result,ac.competency_id,coalesce(cm.mastery,0),public.calculate_diagnostic_confidence(v_student,ac.competency_id,now()),
    case when public.calculate_diagnostic_confidence(v_student,ac.competency_id,now())>=0.7 then 'high' when public.calculate_diagnostic_confidence(v_student,ac.competency_id,now())>=0.4 then 'medium' else 'low' end,
    coalesce(cm.evidence_count,0), case when coalesce(cm.evidence_count,0)=0 then 'unmeasured' when cm.mastery>=0.75 then 'strong' when cm.mastery<0.5 then 'weak' else 'developing' end
  from public.assessment_competencies ac left join public.current_mastery cm on cm.student_id=v_student and cm.competency_id=ac.competency_id where ac.assessment_id=p_assessment_id;
  perform public.record_learning_event(v_student,'AssessmentFinished',now(),jsonb_build_object('assessmentId',p_assessment_id,'answered',v_answered,'correct',v_correct,'coverage',v_coverage),'assessment:'||p_assessment_id||':finished',1::smallint);
  return v_result;
end; $$;

do $$ declare t text; begin foreach t in array array['assessment_statuses','diagnostic_assessments','assessment_competencies','assessment_question_selections','question_attempts','assessment_results','assessment_result_competencies'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
end loop; end $$;
create policy assessment_statuses_read on public.assessment_statuses for select to authenticated using(true);
create policy diagnostic_assessments_read_own on public.diagnostic_assessments for select to authenticated using(student_id=(select auth.uid()));
create policy assessment_competencies_read_own on public.assessment_competencies for select to authenticated using(exists(select 1 from public.diagnostic_assessments a where a.id=assessment_id and a.student_id=(select auth.uid())));
create policy assessment_selections_read_own on public.assessment_question_selections for select to authenticated using(exists(select 1 from public.diagnostic_assessments a where a.id=assessment_id and a.student_id=(select auth.uid())));
create policy question_attempts_read_own on public.question_attempts for select to authenticated using(student_id=(select auth.uid()));
create policy assessment_results_read_own on public.assessment_results for select to authenticated using(student_id=(select auth.uid()));
create policy result_competencies_read_own on public.assessment_result_competencies for select to authenticated using(exists(select 1 from public.assessment_results r where r.id=assessment_result_id and r.student_id=(select auth.uid())));
grant select on public.assessment_statuses,public.diagnostic_assessments,public.assessment_competencies,public.assessment_question_selections,public.question_attempts,public.assessment_results,public.assessment_result_competencies to authenticated;
revoke all on function public.calculate_diagnostic_confidence(uuid,uuid,timestamptz) from public,anon,authenticated;
revoke all on function public.start_diagnostic_assessment(text,uuid,uuid,smallint,smallint,uuid[]) from public,anon; grant execute on function public.start_diagnostic_assessment(text,uuid,uuid,smallint,smallint,uuid[]) to authenticated;
revoke all on function public.select_assessment_question(uuid,uuid,smallint,jsonb) from public,anon; grant execute on function public.select_assessment_question(uuid,uuid,smallint,jsonb) to authenticated;
revoke all on function public.answer_diagnostic_question(uuid,uuid,uuid,integer,text) from public,anon; grant execute on function public.answer_diagnostic_question(uuid,uuid,uuid,integer,text) to authenticated;
revoke all on function public.finish_diagnostic_assessment(uuid) from public,anon; grant execute on function public.finish_diagnostic_assessment(uuid) to authenticated;

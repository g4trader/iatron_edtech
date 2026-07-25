insert into public.assessment_statuses(code,name) values ('paused','Pausada')
on conflict (code) do nothing;

alter table public.diagnostic_assessments
  add column mode text not null default 'legacy'
    check (mode in ('legacy','quick_screening','full_diagnostic')),
  add column blueprint_version text,
  add column current_block smallint not null default 1 check (current_block > 0),
  add column paused_at timestamptz,
  add constraint diagnostic_assessment_pause_consistency check (
    (status = 'paused' and paused_at is not null)
    or (status <> 'paused' and paused_at is null)
  );

create index diagnostic_assessments_mode_started_idx
  on public.diagnostic_assessments(mode, started_at desc);

create table public.diagnostic_coverage_policies (
  version text primary key,
  mode text not null check (mode in ('quick_screening','full_diagnostic')),
  minimum_questions_per_area smallint not null check (minimum_questions_per_area > 0),
  minimum_competencies_per_area smallint not null check (minimum_competencies_per_area > 0),
  minimum_difficulty_levels_per_area smallint not null check (minimum_difficulty_levels_per_area > 0),
  maximum_questions_per_session smallint not null check (maximum_questions_per_session > 0),
  maximum_total_questions smallint not null check (maximum_total_questions >= maximum_questions_per_session),
  duration_minutes smallint not null check (duration_minutes > 0),
  pause_allowed boolean not null,
  minimum_sufficiency numeric(5,4) not null check (minimum_sufficiency between 0 and 1),
  is_synthetic boolean not null,
  limitations text[] not null default '{}',
  valid_from date not null,
  valid_until date,
  check (valid_until is null or valid_until >= valid_from)
);

insert into public.diagnostic_coverage_policies values
('diagnostic-policy-v3-quick-synthetic','quick_screening',1,1,1,10,10,30,false,0.20,true,
 array['Triagem orientativa; não substitui diagnóstico completo.'],'2026-07-25',null),
('diagnostic-policy-v3-full-amrigs-synthetic','full_diagnostic',2,2,2,10,40,120,true,0.80,true,
 array['Parâmetros sintéticos para validação do produto AMRIGS.','Não representam frequência histórica real da banca.'],'2026-07-25',null)
on conflict (version) do nothing;

create table public.diagnostic_blueprint_competencies (
  blueprint_id uuid not null references public.exam_blueprints(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  minimum_evidence smallint not null default 2 check (minimum_evidence > 0),
  expected_difficulties smallint[] not null default '{2,3,4}',
  question_styles text[] not null default '{clinical_case}',
  weight numeric(8,4) not null default 1 check (weight > 0),
  is_required boolean not null default true,
  notes text,
  primary key (blueprint_id, competency_id)
);
create index diagnostic_blueprint_competencies_area_idx
  on public.diagnostic_blueprint_competencies(blueprint_id,specialty_id);

insert into public.diagnostic_blueprint_competencies(
  blueprint_id,specialty_id,competency_id,minimum_evidence,
  expected_difficulties,question_styles,weight,is_required,notes
)
select distinct eb.id,qvs.specialty_id,qvc.competency_id,2,'{2,3,4}'::smallint[],
  '{clinical_case}'::text[],1,true,
  'Matriz sintética AMRIGS para validação; sem inferência histórica.'
from public.exam_blueprints eb
join public.exam_intelligence_profiles ep on ep.id=eb.profile_id
join public.exam_blueprint_areas eba on eba.blueprint_id=eb.id
join public.question_version_specialties qvs on qvs.specialty_id=eba.specialty_id
join public.question_version_competencies qvc on qvc.question_version_id=qvs.question_version_id
where ep.is_synthetic and eb.is_synthetic
on conflict do nothing;

create table public.diagnostic_question_eligibility (
  question_version_id uuid primary key references public.question_versions(id) on delete cascade,
  diagnostic_eligible boolean not null default false,
  answer_key_validated boolean not null default false,
  provenance_kind text not null check (provenance_kind in ('authorized','synthetic')),
  editorial_note text not null,
  validated_at timestamptz,
  check (not diagnostic_eligible or (answer_key_validated and validated_at is not null))
);

insert into public.diagnostic_question_eligibility(
  question_version_id,diagnostic_eligible,answer_key_validated,provenance_kind,
  editorial_note,validated_at
)
select qv.id,true,true,'synthetic',
  'Questão sintética de validação; não representa incidência histórica real da AMRIGS.',
  now()
from public.question_versions qv
where qv.status='published'
  and exists(select 1 from public.question_options qo where qo.question_version_id=qv.id and qo.is_correct)
  and exists(select 1 from public.question_version_competencies qc where qc.question_version_id=qv.id)
  and exists(select 1 from public.question_version_specialties qs where qs.question_version_id=qv.id)
on conflict (question_version_id) do nothing;

create table public.diagnostic_editorial_gaps (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.diagnostic_assessments(id) on delete cascade,
  area_id uuid references public.specialties(id) on delete restrict,
  reason text not null,
  missing_evidence integer not null check (missing_evidence >= 0),
  created_at timestamptz not null default now(),
  unique(assessment_id,area_id,reason)
);
create index diagnostic_editorial_gaps_assessment_idx
  on public.diagnostic_editorial_gaps(assessment_id,created_at);

alter table public.diagnostic_coverage_policies enable row level security;
alter table public.diagnostic_blueprint_competencies enable row level security;
alter table public.diagnostic_question_eligibility enable row level security;
alter table public.diagnostic_editorial_gaps enable row level security;
revoke all on public.diagnostic_coverage_policies,public.diagnostic_blueprint_competencies,
  public.diagnostic_question_eligibility,public.diagnostic_editorial_gaps from anon,authenticated;
grant select on public.diagnostic_coverage_policies,public.diagnostic_blueprint_competencies,
  public.diagnostic_question_eligibility to authenticated;
grant select on public.diagnostic_editorial_gaps to authenticated;
create policy diagnostic_policies_read on public.diagnostic_coverage_policies for select to authenticated using(true);
create policy diagnostic_blueprint_competencies_read on public.diagnostic_blueprint_competencies for select to authenticated using(true);
create policy diagnostic_eligibility_read on public.diagnostic_question_eligibility for select to authenticated using(true);
create policy diagnostic_editorial_gaps_read_own on public.diagnostic_editorial_gaps
  for select to authenticated using(exists(
    select 1 from public.diagnostic_assessments da
    where da.id=assessment_id and da.student_id=(select auth.uid())
  ));

create or replace function public.start_diagnostic_assessment_v3(
  p_objective text,p_exam_program_id uuid,p_specialty_id uuid,
  p_duration_minutes smallint,p_question_count smallint,p_competency_ids uuid[],
  p_mode text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_student uuid:=auth.uid(); v_id uuid; v_policy text; v_blueprint text;
begin
  if v_student is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_mode not in ('quick_screening','full_diagnostic') then raise exception 'invalid diagnostic mode' using errcode='22023'; end if;
  if coalesce(array_length(p_competency_ids,1),0)=0 then raise exception 'competencies required' using errcode='22023'; end if;
  v_policy:=case when p_mode='full_diagnostic' then 'diagnostic-policy-v3-full-amrigs-synthetic' else 'diagnostic-policy-v3-quick-synthetic' end;
  select 'exam-blueprint-v'||eb.version into v_blueprint
  from public.exam_intelligence_profiles ep join public.exam_blueprints eb on eb.profile_id=ep.id
  where ep.exam_program_id=p_exam_program_id and ep.is_active and eb.is_active limit 1;
  insert into public.diagnostic_assessments(
    student_id,objective,exam_program_id,specialty_id,duration_minutes,question_count,
    mode,policy_version,blueprint_version,algorithm_version
  ) values(
    v_student,p_objective,p_exam_program_id,p_specialty_id,p_duration_minutes,p_question_count,
    p_mode,v_policy,v_blueprint,'assessment-v3'
  ) returning id into v_id;
  insert into public.assessment_competencies(assessment_id,competency_id)
  select v_id,competency_id from unnest(p_competency_ids) competency_id on conflict do nothing;
  return v_id;
end $$;
revoke all on function public.start_diagnostic_assessment_v3(text,uuid,uuid,smallint,smallint,uuid[],text) from public,anon;
grant execute on function public.start_diagnostic_assessment_v3(text,uuid,uuid,smallint,smallint,uuid[],text) to authenticated;

create or replace function public.pause_diagnostic_assessment(p_assessment_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  update public.diagnostic_assessments set status='paused',paused_at=now()
  where id=p_assessment_id and student_id=auth.uid() and status='active';
  if not found then raise exception 'active assessment not found' using errcode='42501'; end if;
end $$;
create or replace function public.resume_diagnostic_assessment(p_assessment_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  update public.diagnostic_assessments set status='active',paused_at=null
  where id=p_assessment_id and student_id=auth.uid() and status='paused';
  if not found then raise exception 'paused assessment not found' using errcode='42501'; end if;
end $$;
revoke all on function public.pause_diagnostic_assessment(uuid),public.resume_diagnostic_assessment(uuid) from public,anon;
grant execute on function public.pause_diagnostic_assessment(uuid),public.resume_diagnostic_assessment(uuid) to authenticated;

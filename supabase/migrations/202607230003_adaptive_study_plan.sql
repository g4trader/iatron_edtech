create table public.study_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  objective text not null check (char_length(objective) between 3 and 300),
  target_exam_edition_id uuid references public.exam_editions(id) on delete restrict,
  algorithm text not null default 'deterministic-adaptive-plan',
  algorithm_version text not null default 'study-plan-v1',
  status text not null default 'active' check (status in ('active','superseded','completed')),
  current_version integer not null default 0 check (current_version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index study_plans_one_active_idx on public.study_plans(student_id) where status='active';
create index study_plans_student_created_idx on public.study_plans(student_id,created_at desc);

create table public.study_plan_versions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.study_plans(id) on delete cascade,
  version integer not null check (version > 0),
  period_start date not null,
  period_end date not null,
  generated_at timestamptz not null default now(),
  status text not null default 'current' check (status in ('current','superseded')),
  total_planned_minutes integer not null check (total_planned_minutes >= 0),
  total_available_minutes integer not null check (total_available_minutes >= 0),
  availability_snapshot jsonb not null check (jsonb_typeof(availability_snapshot)='array'),
  input_snapshot jsonb not null check (jsonb_typeof(input_snapshot)='object'),
  input_hash text not null check (input_hash ~ '^[a-f0-9]{64}$'),
  trigger_reason text not null check (char_length(trigger_reason) between 3 and 80),
  algorithm_version text not null,
  unique(plan_id,version), unique(plan_id,input_hash,algorithm_version),
  check(period_end >= period_start),
  check(total_planned_minutes <= total_available_minutes)
);
create index study_plan_versions_plan_generated_idx on public.study_plan_versions(plan_id,generated_at desc);

create table public.study_plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_version_id uuid not null references public.study_plan_versions(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  item_type text not null check (item_type in ('competency_study','review','question_practice','gap_reinforcement','complementary_diagnosis')),
  priority numeric(6,5) not null check (priority between 0 and 1),
  estimated_minutes smallint not null check (estimated_minutes between 5 and 180),
  planned_date date,
  position smallint,
  status text not null check (status in ('planned','in_progress','completed','deferred','skipped','unallocated')),
  recommendation_origin text not null,
  justification jsonb not null check (jsonb_typeof(justification)='object'),
  source_snapshot jsonb not null check (jsonb_typeof(source_snapshot)='object'),
  algorithm_version text not null,
  replan_count smallint not null default 0 check (replan_count between 0 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status='unallocated') = (planned_date is null)),
  check ((planned_date is null and position is null) or (planned_date is not null and position is not null)),
  unique(plan_version_id,competency_id,item_type)
);
create index study_plan_items_version_date_idx on public.study_plan_items(plan_version_id,planned_date,position);
create index study_plan_items_competency_idx on public.study_plan_items(competency_id);
create index study_plan_items_status_idx on public.study_plan_items(status);

create table public.study_plan_item_actions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.study_plan_items(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('started','completed','deferred','skipped')),
  from_status text not null,
  to_status text not null,
  actual_minutes smallint check (actual_minutes between 0 and 720),
  reason text check (reason is null or char_length(reason) between 3 and 500),
  learning_event_id uuid references public.learning_events(id) on delete restrict,
  occurred_at timestamptz not null default now()
);
create index study_plan_item_actions_item_time_idx on public.study_plan_item_actions(item_id,occurred_at);
create index study_plan_item_actions_student_time_idx on public.study_plan_item_actions(student_id,occurred_at desc);

create trigger study_plans_set_updated_at before update on public.study_plans for each row execute function public.set_updated_at();
create trigger study_plan_items_set_updated_at before update on public.study_plan_items for each row execute function public.set_updated_at();
create trigger study_plan_item_actions_immutable before update or delete on public.study_plan_item_actions for each row execute function public.prevent_learning_history_mutation();

insert into public.learning_event_types(code,name,description,produces_evidence) values
('StudyPlanItemStarted','Item do plano iniciado','Atividade pedagógica do plano iniciada.',false),
('StudyPlanItemDeferred','Item do plano adiado','Atividade pedagógica do plano adiada.',false),
('StudyPlanItemSkipped','Item do plano pulado','Atividade pedagógica do plano abandonada.',false)
on conflict(code) do update set name=excluded.name,description=excluded.description,produces_evidence=excluded.produces_evidence;

create or replace function public.persist_study_plan(
  p_objective text,p_target_exam_edition_id uuid,p_period_start date,p_period_end date,
  p_total_available_minutes integer,p_availability_snapshot jsonb,p_input_snapshot jsonb,
  p_input_hash text,p_trigger_reason text,p_items jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_student uuid:=auth.uid();v_plan uuid;v_version integer;v_version_id uuid;v_item jsonb;v_existing uuid;v_total integer:=0;
begin
  if v_student is null then raise exception 'authentication required' using errcode='42501'; end if;
  select pv.id into v_existing from public.study_plan_versions pv join public.study_plans p on p.id=pv.plan_id
  where p.student_id=v_student and pv.input_hash=p_input_hash and pv.algorithm_version='study-plan-v1' order by pv.generated_at desc limit 1;
  if v_existing is not null then return v_existing; end if;
  select id into v_plan from public.study_plans where student_id=v_student and status='active';
  if v_plan is null then insert into public.study_plans(student_id,objective,target_exam_edition_id) values(v_student,p_objective,p_target_exam_edition_id) returning id into v_plan;
  else update public.study_plans set objective=p_objective,target_exam_edition_id=p_target_exam_edition_id where id=v_plan; end if;
  select current_version+1 into v_version from public.study_plans where id=v_plan for update;
  select coalesce(sum((item->>'estimatedMinutes')::integer) filter(where item->>'plannedDate' is not null),0) into v_total from jsonb_array_elements(p_items) item;
  update public.study_plan_versions set status='superseded' where plan_id=v_plan and status='current';
  insert into public.study_plan_versions(plan_id,version,period_start,period_end,total_planned_minutes,total_available_minutes,availability_snapshot,input_snapshot,input_hash,trigger_reason,algorithm_version)
  values(v_plan,v_version,p_period_start,p_period_end,v_total,p_total_available_minutes,p_availability_snapshot,p_input_snapshot,p_input_hash,p_trigger_reason,'study-plan-v1') returning id into v_version_id;
  for v_item in select value from jsonb_array_elements(p_items) loop
    insert into public.study_plan_items(plan_version_id,competency_id,item_type,priority,estimated_minutes,planned_date,position,status,recommendation_origin,justification,source_snapshot,algorithm_version,replan_count)
    values(v_version_id,(v_item->>'competencyId')::uuid,v_item->>'itemType',(v_item->>'priority')::numeric,(v_item->>'estimatedMinutes')::smallint,
      nullif(v_item->>'plannedDate','')::date,(v_item->>'position')::smallint,v_item->>'status',v_item->>'origin',v_item->'justification',v_item->'sourceSnapshot','study-plan-v1',coalesce((v_item->>'replanCount')::smallint,0));
  end loop;
  update public.study_plans set current_version=v_version where id=v_plan;
  return v_version_id;
end;$$;

create or replace function public.record_study_plan_item_action(p_item_id uuid,p_action text,p_actual_minutes smallint default null,p_reason text default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_student uuid:=auth.uid();v_status text;v_type text;v_to text;v_action uuid;v_event uuid;v_competency uuid;
begin
  select i.status,i.item_type,i.competency_id into v_status,v_type,v_competency from public.study_plan_items i join public.study_plan_versions pv on pv.id=i.plan_version_id join public.study_plans p on p.id=pv.plan_id where i.id=p_item_id and p.student_id=v_student and pv.status='current' for update of i;
  if v_status is null then raise exception 'current plan item not found' using errcode='42501'; end if;
  v_to:=case p_action when 'started' then 'in_progress' when 'completed' then 'completed' when 'deferred' then 'deferred' when 'skipped' then 'skipped' else null end;
  if v_to is null then raise exception 'invalid action' using errcode='22023'; end if;
  if (p_action='started' and v_status<>'planned') or (p_action='completed' and v_status not in('planned','in_progress')) or (p_action in('deferred','skipped') and v_status not in('planned','in_progress')) then raise exception 'invalid item transition' using errcode='22023'; end if;
  if p_action='completed' and p_actual_minutes is null then raise exception 'actual minutes required' using errcode='22023'; end if;
  v_event:=public.record_learning_event(v_student,case when p_action='completed' and v_type='review' then 'ReviewCompleted' when p_action='completed' then 'StudySessionCompleted' when p_action='started' then 'StudyPlanItemStarted' when p_action='deferred' then 'StudyPlanItemDeferred' else 'StudyPlanItemSkipped' end,now(),jsonb_build_object('planItemId',p_item_id,'competencyId',v_competency,'actualMinutes',p_actual_minutes,'reason',p_reason),'study-plan-item:'||p_item_id||':'||p_action||':'||extract(epoch from clock_timestamp()),1);
  insert into public.study_plan_item_actions(item_id,student_id,action,from_status,to_status,actual_minutes,reason,learning_event_id) values(p_item_id,v_student,p_action,v_status,v_to,p_actual_minutes,p_reason,v_event) returning id into v_action;
  update public.study_plan_items set status=v_to where id=p_item_id;
  return v_action;
end;$$;

do $$ declare t text;begin foreach t in array array['study_plans','study_plan_versions','study_plan_items','study_plan_item_actions'] loop execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from anon,authenticated',t);end loop;end$$;
create policy study_plans_read_own on public.study_plans for select to authenticated using(student_id=(select auth.uid()));
create policy study_plan_versions_read_own on public.study_plan_versions for select to authenticated using(exists(select 1 from public.study_plans p where p.id=plan_id and p.student_id=(select auth.uid())));
create policy study_plan_items_read_own on public.study_plan_items for select to authenticated using(exists(select 1 from public.study_plan_versions pv join public.study_plans p on p.id=pv.plan_id where pv.id=plan_version_id and p.student_id=(select auth.uid())));
create policy study_plan_actions_read_own on public.study_plan_item_actions for select to authenticated using(student_id=(select auth.uid()));
grant select on public.study_plans,public.study_plan_versions,public.study_plan_items,public.study_plan_item_actions to authenticated;
revoke all on function public.persist_study_plan(text,uuid,date,date,integer,jsonb,jsonb,text,text,jsonb) from public,anon;grant execute on function public.persist_study_plan(text,uuid,date,date,integer,jsonb,jsonb,text,text,jsonb) to authenticated;
revoke all on function public.record_study_plan_item_action(uuid,text,smallint,text) from public,anon;grant execute on function public.record_study_plan_item_action(uuid,text,smallint,text) to authenticated;

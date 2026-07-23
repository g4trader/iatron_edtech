create table public.tutor_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  content_sha256 text not null check (length(content_sha256) = 64),
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index tutor_prompt_versions_one_active_idx
  on public.tutor_prompt_versions (active) where active;

insert into public.tutor_prompt_versions(version, content_sha256, active)
values ('tutor-system-v1', repeat('0', 64), true);

create table public.tutor_conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nova conversa' check (char_length(title) between 1 and 120),
  mode text not null check (mode in ('general','competency_explanation','question_explanation','gap_coaching','plan_explanation','study_guidance')),
  origin_type text check (origin_type is null or origin_type in ('competency','question','gap','plan_item','assessment')),
  origin_id uuid,
  status text not null default 'active' check (status in ('active','archived')),
  archived_at timestamptz,
  retention_until timestamptz not null default (now() + interval '365 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((origin_type is null) = (origin_id is null))
);
create index tutor_conversations_student_updated_idx on public.tutor_conversations(student_id, updated_at desc);

create table public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.tutor_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) <= 20000),
  status text not null check (status in ('pending','streaming','complete','partial','failed','cancelled')),
  request_id uuid,
  response_to_id uuid references public.tutor_messages(id),
  model text,
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index tutor_messages_conversation_created_idx on public.tutor_messages(conversation_id, created_at, id);
create unique index tutor_messages_request_role_idx on public.tutor_messages(conversation_id, request_id, role) where request_id is not null;

create table public.tutor_generations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.tutor_conversations(id) on delete cascade,
  user_message_id uuid not null references public.tutor_messages(id),
  assistant_message_id uuid not null references public.tutor_messages(id),
  request_id uuid not null unique,
  prompt_version text not null references public.tutor_prompt_versions(version),
  model text not null,
  status text not null check (status in ('streaming','complete','partial','failed','cancelled')),
  openai_response_id text,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  total_tokens integer not null default 0 check (total_tokens >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  error_code text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index tutor_generations_student_created_idx on public.tutor_generations(student_id, created_at desc);

create table public.tutor_context_references (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.tutor_generations(id) on delete cascade,
  reference_type text not null check (reference_type in ('profile','target_exam','study_plan','competency','mastery','gap','evidence','question','guideline','assessment')),
  entity_id uuid,
  label text not null check (char_length(label) between 1 and 200),
  snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(snapshot) = 'object'),
  position smallint not null check (position between 1 and 50),
  created_at timestamptz not null default now(),
  unique(generation_id, position)
);
create index tutor_context_references_generation_idx on public.tutor_context_references(generation_id, position);

alter table public.tutor_prompt_versions enable row level security;
alter table public.tutor_conversations enable row level security;
alter table public.tutor_messages enable row level security;
alter table public.tutor_generations enable row level security;
alter table public.tutor_context_references enable row level security;

create policy tutor_conversations_select_own on public.tutor_conversations for select to authenticated using (student_id = auth.uid());
create policy tutor_messages_select_own on public.tutor_messages for select to authenticated using (
  exists(select 1 from public.tutor_conversations c where c.id = conversation_id and c.student_id = auth.uid())
);
create policy tutor_generations_select_own on public.tutor_generations for select to authenticated using (student_id = auth.uid());
create policy tutor_context_references_select_own on public.tutor_context_references for select to authenticated using (
  exists(select 1 from public.tutor_generations g where g.id = generation_id and g.student_id = auth.uid())
);

create function public.create_tutor_conversation(p_mode text, p_origin_type text default null, p_origin_id uuid default null)
returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  insert into public.tutor_conversations(student_id, mode, origin_type, origin_id)
  values(auth.uid(), p_mode, p_origin_type, p_origin_id) returning id into v_id;
  return v_id;
end $$;

create function public.begin_tutor_generation(p_conversation_id uuid, p_request_id uuid, p_content text, p_model text, p_prompt_version text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_user uuid; v_assistant uuid; v_generation uuid;
begin
  if not exists(select 1 from public.tutor_conversations where id=p_conversation_id and student_id=auth.uid() and status='active')
    then raise exception 'conversation unavailable'; end if;
  if (select count(*) from public.tutor_generations where student_id=auth.uid() and created_at > now()-interval '1 minute') >= 10
    then raise exception 'rate limit exceeded'; end if;
  if (select count(*) from public.tutor_generations where student_id=auth.uid() and created_at > now()-interval '1 day') >= 100
    then raise exception 'daily rate limit exceeded'; end if;
  insert into public.tutor_messages(conversation_id, role, content, status, request_id, completed_at)
    values(p_conversation_id,'user',p_content,'complete',p_request_id,now()) returning id into v_user;
  insert into public.tutor_messages(conversation_id, role, content, status, request_id, response_to_id, model)
    values(p_conversation_id,'assistant','','streaming',p_request_id,v_user,p_model) returning id into v_assistant;
  insert into public.tutor_generations(student_id,conversation_id,user_message_id,assistant_message_id,request_id,prompt_version,model,status)
    values(auth.uid(),p_conversation_id,v_user,v_assistant,p_request_id,p_prompt_version,p_model,'streaming') returning id into v_generation;
  update public.tutor_conversations set updated_at=now(), title=case when title='Nova conversa' then left(p_content,120) else title end where id=p_conversation_id;
  return jsonb_build_object('generationId',v_generation,'assistantMessageId',v_assistant);
end $$;

create function public.finish_tutor_generation(
  p_request_id uuid, p_content text, p_status text, p_response_id text,
  p_input_tokens integer, p_output_tokens integer, p_total_tokens integer,
  p_latency_ms integer, p_error_code text, p_references jsonb default '[]'::jsonb
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_generation public.tutor_generations; v_ref jsonb; v_position integer := 0;
begin
  select * into v_generation from public.tutor_generations where request_id=p_request_id and student_id=auth.uid() for update;
  if not found then raise exception 'generation unavailable'; end if;
  update public.tutor_messages set content=p_content,status=p_status,completed_at=now(),error_code=p_error_code where id=v_generation.assistant_message_id;
  update public.tutor_generations set status=p_status,openai_response_id=p_response_id,input_tokens=p_input_tokens,
    output_tokens=p_output_tokens,total_tokens=p_total_tokens,latency_ms=p_latency_ms,error_code=p_error_code,completed_at=now()
    where id=v_generation.id;
  for v_ref in select * from jsonb_array_elements(p_references) loop
    v_position := v_position + 1;
    insert into public.tutor_context_references(generation_id,reference_type,entity_id,label,snapshot,position)
    values(v_generation.id,v_ref->>'type',nullif(v_ref->>'entityId','')::uuid,v_ref->>'label',coalesce(v_ref->'snapshot','{}'::jsonb),v_position);
  end loop;
end $$;

create function public.archive_tutor_conversation(p_conversation_id uuid)
returns void language sql security definer set search_path = public, pg_temp as $$
  update public.tutor_conversations set status='archived',archived_at=now(),updated_at=now()
  where id=p_conversation_id and student_id=auth.uid()
$$;

revoke all on function public.create_tutor_conversation(text,text,uuid) from public;
revoke all on function public.begin_tutor_generation(uuid,uuid,text,text,text) from public;
revoke all on function public.finish_tutor_generation(uuid,text,text,text,integer,integer,integer,integer,text,jsonb) from public;
revoke all on function public.archive_tutor_conversation(uuid) from public;
grant execute on function public.create_tutor_conversation(text,text,uuid) to authenticated;
grant execute on function public.begin_tutor_generation(uuid,uuid,text,text,text) to authenticated;
grant execute on function public.finish_tutor_generation(uuid,text,text,text,integer,integer,integer,integer,text,jsonb) to authenticated;
grant execute on function public.archive_tutor_conversation(uuid) to authenticated;

revoke insert, update, delete on public.tutor_conversations, public.tutor_messages, public.tutor_generations, public.tutor_context_references from authenticated;

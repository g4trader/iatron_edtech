create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in (
    'student','mentor','editor','admin',
    'medical_reviewer','legal_reviewer','super_admin'
  )),
  granted_by uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);
create index user_roles_role_idx on public.user_roles(role, user_id);

insert into public.user_roles(user_id, role)
select id, 'student' from public.profiles
on conflict do nothing;

create or replace function public.add_default_student_role()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_roles(user_id, role) values (new.id, 'student')
  on conflict do nothing;
  return new;
end;
$$;
create trigger profiles_add_default_student_role
after insert on public.profiles for each row
execute function public.add_default_student_role();

create table public.mentor_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  specialty_id uuid references public.specialties(id) on delete restrict,
  professional_name text not null check (char_length(professional_name) between 2 and 120),
  professional_registration text,
  authorization_status text not null default 'pending'
    check (authorization_status in ('pending','authorized','suspended','revoked')),
  mfa_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index mentor_profiles_specialty_idx on public.mentor_profiles(specialty_id)
where authorization_status = 'authorized';
create trigger mentor_profiles_set_updated_at before update on public.mentor_profiles
for each row execute function public.set_updated_at();

create or replace function public.has_app_role(p_role text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid())
      and role in (p_role, 'super_admin')
  );
$$;

create or replace function public.can_manage_editorial()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.has_app_role('editor') or public.has_app_role('admin');
$$;

create table public.learning_contents (
  id uuid primary key default gen_random_uuid(),
  canonical_key text not null unique check (canonical_key ~ '^[a-z0-9][a-z0-9._-]+$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  area_id uuid references public.medical_areas(id) on delete restrict,
  specialty_id uuid references public.specialties(id) on delete restrict,
  theme_id uuid references public.themes(id) on delete restrict,
  subtheme_id uuid references public.subthemes(id) on delete restrict,
  competency_id uuid references public.competencies(id) on delete restrict,
  exam_program_id uuid references public.exam_programs(id) on delete restrict,
  guideline_id uuid references public.guidelines(id) on delete restrict,
  assigned_mentor_id uuid references public.mentor_profiles(user_id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  current_published_version_id uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index learning_contents_taxonomy_idx
on public.learning_contents(specialty_id, theme_id, competency_id);
create index learning_contents_mentor_idx on public.learning_contents(assigned_mentor_id);
create trigger learning_contents_set_updated_at before update on public.learning_contents
for each row execute function public.set_updated_at();

create table public.learning_content_versions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.learning_contents(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  schema_version integer not null default 1 check (schema_version > 0),
  language text not null default 'pt-BR',
  title text not null check (char_length(title) between 3 and 180),
  subtitle text,
  estimated_minutes smallint not null check (estimated_minutes between 1 and 240),
  objectives jsonb not null default '[]'::jsonb check (jsonb_typeof(objectives) = 'array'),
  summary text not null,
  sections jsonb not null default '[]'::jsonb check (jsonb_typeof(sections) = 'array'),
  key_points jsonb not null default '[]'::jsonb check (jsonb_typeof(key_points) = 'array'),
  clinical_reasoning text,
  exam_application text,
  common_mistakes jsonb not null default '[]'::jsonb check (jsonb_typeof(common_mistakes) = 'array'),
  quick_review jsonb not null default '[]'::jsonb check (jsonb_typeof(quick_review) = 'array'),
  conclusion text,
  video jsonb,
  editorial_status text not null check (editorial_status in (
    'draft','ai_draft','editorial_review','awaiting_mentor_assignment',
    'awaiting_mentor_review','mentor_changes_requested','mentor_rejected',
    'mentor_approved','ready_to_publish','published','archived','superseded'
  )),
  ai_assisted boolean not null default false,
  ai_model text,
  prompt_version text,
  generation_id uuid,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  estimated_cost numeric(12,6) check (estimated_cost is null or estimated_cost >= 0),
  author_id uuid not null references public.profiles(id) on delete restrict,
  editorial_reviewer_id uuid references public.profiles(id) on delete restrict,
  provenance jsonb not null default '{}'::jsonb,
  is_synthetic boolean not null default false,
  content_hash text not null,
  valid_from date,
  valid_until date,
  published_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(content_id, version_number),
  unique(id, content_id),
  check ((not ai_assisted) or ai_model is not null),
  check (valid_until is null or valid_from is null or valid_until >= valid_from),
  check ((editorial_status <> 'published') or published_at is not null)
);
alter table public.learning_contents
  add constraint learning_contents_current_version_fk
  foreign key (current_published_version_id, id)
  references public.learning_content_versions(id, content_id)
  deferrable initially deferred;
create index learning_content_versions_status_idx
on public.learning_content_versions(editorial_status, created_at);
create index learning_content_versions_content_idx
on public.learning_content_versions(content_id, version_number desc);

create or replace function public.editorial_version_hash(
  p_title text, p_subtitle text, p_objectives jsonb, p_summary text,
  p_sections jsonb, p_key_points jsonb, p_clinical_reasoning text,
  p_exam_application text, p_common_mistakes jsonb, p_quick_review jsonb,
  p_conclusion text, p_video jsonb
) returns text language sql immutable set search_path = '' as $$
  select encode(extensions.digest(
    jsonb_build_object(
      'title',p_title,'subtitle',p_subtitle,'objectives',p_objectives,
      'summary',p_summary,'sections',p_sections,'keyPoints',p_key_points,
      'clinicalReasoning',p_clinical_reasoning,'examApplication',p_exam_application,
      'commonMistakes',p_common_mistakes,'quickReview',p_quick_review,
      'conclusion',p_conclusion,'video',p_video
    )::text, 'sha256'
  ), 'hex');
$$;

create or replace function public.protect_reviewed_version()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and old.editorial_status in (
    'mentor_approved','ready_to_publish','published','archived','superseded'
  ) and new.content_hash <> old.content_hash then
    raise exception 'Reviewed content is immutable; create a new version';
  end if;
  if new.content_hash <> public.editorial_version_hash(
    new.title,new.subtitle,new.objectives,new.summary,new.sections,new.key_points,
    new.clinical_reasoning,new.exam_application,new.common_mistakes,
    new.quick_review,new.conclusion,new.video
  ) then raise exception 'Content hash does not match version body'; end if;
  return new;
end;
$$;
create trigger learning_content_versions_protect
before insert or update on public.learning_content_versions
for each row execute function public.protect_reviewed_version();

create table public.content_references (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors_or_organization text,
  reference_type text not null check (reference_type in (
    'book','guideline','consensus','article','protocol','official_site','other'
  )),
  publication_year smallint,
  edition text,
  publisher text,
  isbn text,
  doi text,
  pmid text,
  url text,
  accessed_on date,
  origin text not null,
  verification_status text not null check (verification_status in (
    'suggested_by_ai','pending_verification','verified','rejected','outdated'
  )),
  verified_by uuid references public.profiles(id) on delete restrict,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  check ((verification_status <> 'verified') or verified_by is not null)
);
create index content_references_status_idx on public.content_references(verification_status);

create table public.learning_content_version_references (
  version_id uuid not null references public.learning_content_versions(id) on delete cascade,
  reference_id uuid not null references public.content_references(id) on delete restrict,
  is_required boolean not null default true,
  position smallint not null default 1 check (position > 0),
  primary key(version_id, reference_id)
);

create table public.content_reviews (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.learning_contents(id) on delete restrict,
  version_id uuid not null references public.learning_content_versions(id) on delete restrict,
  mentor_id uuid not null references public.mentor_profiles(user_id) on delete restrict,
  decision text not null check (decision in ('approved','changes_requested','rejected')),
  declaration text,
  comment text,
  issue_category text check (issue_category in (
    'content','reference','clarity','currency','safety','structure','other'
  )),
  observed_references jsonb not null default '[]'::jsonb,
  version_hash text not null,
  request_id text not null,
  safe_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(version_id, mentor_id, request_id),
  check (decision <> 'approved' or char_length(coalesce(declaration,'')) >= 30),
  check (decision = 'approved' or char_length(coalesce(comment,'')) >= 10)
);
create index content_reviews_version_idx on public.content_reviews(version_id, created_at desc);

create table public.editorial_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  actor_role text not null,
  resource_type text not null,
  resource_id uuid not null,
  resource_version_id uuid,
  action text not null,
  previous_state text,
  next_state text,
  metadata jsonb not null default '{}'::jsonb,
  request_id text not null,
  created_at timestamptz not null default now()
);
create index editorial_audit_resource_idx
on public.editorial_audit_events(resource_type, resource_id, created_at desc);
create index editorial_audit_actor_idx on public.editorial_audit_events(actor_id, created_at desc);

create table public.content_review_requests (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.learning_contents(id) on delete cascade,
  version_id uuid not null references public.learning_content_versions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  active boolean not null default true,
  requested_at timestamptz not null default now(),
  last_requested_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  unique(version_id, student_id)
);
create index content_review_requests_queue_idx
on public.content_review_requests(version_id, active, requested_at);

create table public.editorial_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  resource_id uuid,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index editorial_notifications_recipient_idx
on public.editorial_notifications(recipient_id, read_at, created_at desc);

create table public.editorial_email_events (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  content_id uuid references public.learning_contents(id) on delete restrict,
  version_id uuid references public.learning_content_versions(id) on delete restrict,
  event_type text not null check (event_type in (
    'queued','sent','delivered','bounced','opened','clicked','failed','retrying'
  )),
  provider_id text,
  idempotency_key text not null unique,
  error_code text,
  created_at timestamptz not null default now()
);

create table public.content_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.profiles(id) on delete restrict,
  content_id uuid references public.learning_contents(id) on delete set null,
  briefing jsonb not null,
  briefing_hash text not null,
  prompt_version text not null,
  model text not null,
  status text not null check (status in ('queued','running','completed','failed')),
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(12,6),
  error_code text,
  retry_count smallint not null default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(briefing_hash, prompt_version)
);

create table public.plan_item_material_versions (
  plan_item_id uuid primary key references public.study_plan_items(id) on delete cascade,
  content_id uuid not null references public.learning_contents(id) on delete restrict,
  version_id uuid not null references public.learning_content_versions(id) on delete restrict,
  assigned_at timestamptz not null default now()
);

create or replace function public.prevent_audit_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin raise exception 'Editorial audit is append-only'; end;
$$;
create trigger editorial_audit_immutable before update or delete
on public.editorial_audit_events for each row execute function public.prevent_audit_mutation();
create trigger content_reviews_immutable before update or delete
on public.content_reviews for each row execute function public.prevent_audit_mutation();

create or replace function public.create_learning_content_draft(
  p_canonical_key text, p_slug text, p_title text, p_summary text,
  p_estimated_minutes smallint, p_objectives jsonb, p_sections jsonb,
  p_key_points jsonb, p_exam_application text, p_common_mistakes jsonb,
  p_quick_review jsonb, p_conclusion text, p_specialty_id uuid default null,
  p_competency_id uuid default null, p_ai_assisted boolean default false,
  p_ai_model text default null, p_prompt_version text default null,
  p_is_synthetic boolean default false, p_request_id text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_content uuid; v_version uuid; v_status text; v_hash text;
begin
  if not public.can_manage_editorial() then raise exception 'Forbidden'; end if;
  if p_ai_assisted and (p_ai_model is null or p_prompt_version is null)
    then raise exception 'AI provenance required'; end if;
  v_status := case when p_ai_assisted then 'ai_draft' else 'draft' end;
  insert into public.learning_contents(
    canonical_key,slug,specialty_id,competency_id,created_by
  ) values (
    p_canonical_key,p_slug,p_specialty_id,p_competency_id,(select auth.uid())
  ) returning id into v_content;
  v_hash := public.editorial_version_hash(
    p_title,null,p_objectives,p_summary,p_sections,p_key_points,null,
    p_exam_application,p_common_mistakes,p_quick_review,p_conclusion,null
  );
  insert into public.learning_content_versions(
    content_id,version_number,title,estimated_minutes,objectives,summary,sections,
    key_points,exam_application,common_mistakes,quick_review,conclusion,
    editorial_status,ai_assisted,ai_model,prompt_version,author_id,is_synthetic,
    content_hash,provenance
  ) values (
    v_content,1,p_title,p_estimated_minutes,p_objectives,p_summary,p_sections,
    p_key_points,p_exam_application,p_common_mistakes,p_quick_review,p_conclusion,
    v_status,p_ai_assisted,p_ai_model,p_prompt_version,(select auth.uid()),
    p_is_synthetic,v_hash,jsonb_build_object('origin','editorial_mvp')
  ) returning id into v_version;
  insert into public.editorial_audit_events(
    actor_id,actor_role,resource_type,resource_id,resource_version_id,action,
    next_state,request_id
  ) values (
    (select auth.uid()),case when public.has_app_role('admin') then 'admin' else 'editor' end,
    'learning_content',v_content,v_version,'created',v_status,
    coalesce(p_request_id,gen_random_uuid()::text)
  );
  return v_version;
end;
$$;

create or replace function public.create_learning_content_version(
  p_content_id uuid, p_source_version_id uuid, p_title text, p_summary text,
  p_sections jsonb, p_request_id text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_source public.learning_content_versions%rowtype; v_version uuid; v_number integer; v_hash text;
begin
  if not public.can_manage_editorial() then raise exception 'Forbidden'; end if;
  select * into v_source from public.learning_content_versions
  where id=p_source_version_id and content_id=p_content_id;
  if not found then raise exception 'Source version not found'; end if;
  select coalesce(max(version_number),0)+1 into v_number
  from public.learning_content_versions where content_id=p_content_id;
  v_hash := public.editorial_version_hash(
    p_title,v_source.subtitle,v_source.objectives,p_summary,p_sections,
    v_source.key_points,v_source.clinical_reasoning,v_source.exam_application,
    v_source.common_mistakes,v_source.quick_review,v_source.conclusion,v_source.video
  );
  insert into public.learning_content_versions(
    content_id,version_number,schema_version,language,title,subtitle,
    estimated_minutes,objectives,summary,sections,key_points,clinical_reasoning,
    exam_application,common_mistakes,quick_review,conclusion,video,
    editorial_status,ai_assisted,ai_model,prompt_version,author_id,provenance,
    is_synthetic,content_hash
  ) select
    content_id,v_number,schema_version,language,p_title,subtitle,
    estimated_minutes,objectives,p_summary,p_sections,key_points,clinical_reasoning,
    exam_application,common_mistakes,quick_review,conclusion,video,
    'draft',ai_assisted,ai_model,prompt_version,(select auth.uid()),provenance,
    is_synthetic,v_hash
  from public.learning_content_versions where id=p_source_version_id
  returning id into v_version;
  insert into public.editorial_audit_events(
    actor_id,actor_role,resource_type,resource_id,resource_version_id,action,
    previous_state,next_state,metadata,request_id
  ) values (
    (select auth.uid()),case when public.has_app_role('admin') then 'admin' else 'editor' end,
    'learning_content',p_content_id,v_version,'version_created',
    v_source.editorial_status,'draft',jsonb_build_object('sourceVersionId',p_source_version_id),
    p_request_id
  );
  return v_version;
end;
$$;

create or replace function public.submit_content_for_review(
  p_version_id uuid, p_mentor_id uuid, p_request_id text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_content public.learning_contents%rowtype; v_version public.learning_content_versions%rowtype;
begin
  if not public.can_manage_editorial() then raise exception 'Forbidden'; end if;
  select * into v_version from public.learning_content_versions where id=p_version_id for update;
  if v_version.editorial_status not in ('draft','ai_draft','editorial_review','mentor_changes_requested')
    then raise exception 'Invalid editorial transition'; end if;
  select * into v_content from public.learning_contents where id=v_version.content_id for update;
  if not exists (
    select 1 from public.mentor_profiles m join public.user_roles r on r.user_id=m.user_id
    where m.user_id=p_mentor_id and m.authorization_status='authorized' and r.role='mentor'
      and (m.specialty_id=v_content.specialty_id or v_content.specialty_id is null)
  ) then raise exception 'Mentor is not authorized for this specialty'; end if;
  update public.learning_contents set assigned_mentor_id=p_mentor_id where id=v_content.id;
  update public.learning_content_versions set
    editorial_status='awaiting_mentor_review', editorial_reviewer_id=(select auth.uid())
  where id=p_version_id;
  insert into public.editorial_notifications(recipient_id,notification_type,resource_id,title,body)
  values(p_mentor_id,'content_assigned',v_content.id,'Novo conteúdo para revisão',v_version.title);
  insert into public.editorial_email_events(
    recipient_id,content_id,version_id,event_type,idempotency_key
  ) values(p_mentor_id,v_content.id,p_version_id,'queued','review-assignment:'||p_version_id::text)
  on conflict(idempotency_key) do nothing;
  insert into public.editorial_audit_events(
    actor_id,actor_role,resource_type,resource_id,resource_version_id,action,
    previous_state,next_state,metadata,request_id
  ) values(
    (select auth.uid()),case when public.has_app_role('admin') then 'admin' else 'editor' end,
    'learning_content',v_content.id,p_version_id,'submitted_for_review',
    v_version.editorial_status,'awaiting_mentor_review',
    jsonb_build_object('mentorId',p_mentor_id),p_request_id
  );
  return v_content.id;
end;
$$;

create or replace function public.review_learning_content(
  p_version_id uuid, p_decision text, p_declaration text, p_comment text,
  p_issue_category text, p_request_id text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_content public.learning_contents%rowtype; v_version public.learning_content_versions%rowtype;
declare v_review uuid; v_next text;
begin
  if not public.has_app_role('mentor') then raise exception 'Forbidden'; end if;
  select * into v_version from public.learning_content_versions where id=p_version_id for update;
  select * into v_content from public.learning_contents where id=v_version.content_id;
  if v_version.editorial_status <> 'awaiting_mentor_review' then raise exception 'Version is not awaiting review'; end if;
  if v_content.assigned_mentor_id <> (select auth.uid()) then raise exception 'Content is not assigned to mentor'; end if;
  if not exists (
    select 1 from public.mentor_profiles
    where user_id=(select auth.uid()) and authorization_status='authorized'
      and (specialty_id=v_content.specialty_id or v_content.specialty_id is null)
  ) then raise exception 'Mentor is not authorized for specialty'; end if;
  v_next := case p_decision
    when 'approved' then 'mentor_approved'
    when 'changes_requested' then 'mentor_changes_requested'
    when 'rejected' then 'mentor_rejected'
    else null end;
  if v_next is null then raise exception 'Invalid review decision'; end if;
  insert into public.content_reviews(
    content_id,version_id,mentor_id,decision,declaration,comment,issue_category,
    version_hash,request_id,safe_context
  ) values(
    v_content.id,p_version_id,(select auth.uid()),p_decision,p_declaration,p_comment,
    p_issue_category,v_version.content_hash,p_request_id,
    jsonb_build_object('auth','authenticated')
  ) returning id into v_review;
  update public.learning_content_versions set editorial_status=v_next,reviewed_at=now()
  where id=p_version_id;
  insert into public.editorial_audit_events(
    actor_id,actor_role,resource_type,resource_id,resource_version_id,action,
    previous_state,next_state,metadata,request_id
  ) values(
    (select auth.uid()),'mentor','learning_content',v_content.id,p_version_id,
    'mentor_'||p_decision,'awaiting_mentor_review',v_next,
    jsonb_build_object('reviewId',v_review,'versionHash',v_version.content_hash),p_request_id
  );
  insert into public.editorial_notifications(
    recipient_id,notification_type,resource_id,title,body
  ) select user_id,'mentor_decision',v_content.id,'Revisão do mentor concluída',v_version.title
    from public.user_roles where role in ('editor','admin');
  return v_review;
end;
$$;

create or replace function public.publish_learning_content(
  p_version_id uuid, p_request_id text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_version public.learning_content_versions%rowtype; v_content uuid;
begin
  if not public.has_app_role('admin') then raise exception 'Forbidden'; end if;
  select * into v_version from public.learning_content_versions where id=p_version_id for update;
  if v_version.editorial_status <> 'mentor_approved' then raise exception 'Mentor approval required'; end if;
  if not exists (
    select 1 from public.content_reviews
    where version_id=p_version_id and decision='approved'
      and version_hash=v_version.content_hash
  ) then raise exception 'Valid review for version hash required'; end if;
  if not exists (
    select 1 from public.learning_content_version_references vr
    join public.content_references r on r.id=vr.reference_id
    where vr.version_id=p_version_id and vr.is_required
      and r.verification_status='verified'
  ) then raise exception 'At least one verified required reference is required'; end if;
  if exists (
    select 1 from public.learning_content_version_references vr
    join public.content_references r on r.id=vr.reference_id
    where vr.version_id=p_version_id and vr.is_required
      and r.verification_status <> 'verified'
  ) then raise exception 'Required references must be verified'; end if;
  v_content:=v_version.content_id;
  update public.learning_content_versions
    set editorial_status='superseded'
    where content_id=v_content and editorial_status='published' and id<>p_version_id;
  update public.learning_content_versions
    set editorial_status='published',published_at=now()
    where id=p_version_id;
  update public.learning_contents
    set current_published_version_id=p_version_id where id=v_content;
  insert into public.editorial_audit_events(
    actor_id,actor_role,resource_type,resource_id,resource_version_id,action,
    previous_state,next_state,metadata,request_id
  ) values(
    (select auth.uid()),'admin','learning_content',v_content,p_version_id,
    'published','mentor_approved','published',
    jsonb_build_object('versionHash',v_version.content_hash),p_request_id
  );
  return v_content;
end;
$$;

create or replace function public.request_content_review_priority(
  p_version_id uuid, p_request_id text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_content uuid; v_request uuid; v_last timestamptz;
begin
  select content_id into v_content from public.learning_content_versions
  where id=p_version_id and editorial_status<>'published';
  if v_content is null then raise exception 'Review request is not available'; end if;
  select last_requested_at into v_last from public.content_review_requests
  where version_id=p_version_id and student_id=(select auth.uid());
  if v_last is not null and v_last > now()-interval '1 hour' then
    select id into v_request from public.content_review_requests
    where version_id=p_version_id and student_id=(select auth.uid());
    return v_request;
  end if;
  insert into public.content_review_requests(
    content_id,version_id,student_id,active,last_requested_at
  ) values(v_content,p_version_id,(select auth.uid()),true,now())
  on conflict(version_id,student_id) do update set
    active=true,last_requested_at=now(),withdrawn_at=null
  returning id into v_request;
  insert into public.editorial_audit_events(
    actor_id,actor_role,resource_type,resource_id,resource_version_id,action,
    next_state,request_id
  ) values(
    (select auth.uid()),'student','learning_content',v_content,p_version_id,
    'review_priority_requested','active',p_request_id
  );
  return v_request;
end;
$$;

create or replace function public.review_assignment_email_payload(p_version_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if not public.can_manage_editorial() then raise exception 'Forbidden'; end if;
  select jsonb_build_object(
    'recipientId',c.assigned_mentor_id,
    'recipientEmail',p.email,
    'mentorName',m.professional_name,
    'contentId',c.id,
    'versionId',v.id,
    'title',v.title,
    'versionNumber',v.version_number,
    'estimatedMinutes',v.estimated_minutes,
    'requestCount',(select count(*) from public.content_review_requests r where r.version_id=v.id and r.active),
    'idempotencyKey','review-assignment:'||v.id::text
  ) into v_result
  from public.learning_content_versions v
  join public.learning_contents c on c.id=v.content_id
  join public.mentor_profiles m on m.user_id=c.assigned_mentor_id
  join public.profiles p on p.id=m.user_id
  where v.id=p_version_id and v.editorial_status='awaiting_mentor_review';
  if v_result is null then raise exception 'Review assignment not found'; end if;
  return v_result;
end;
$$;

create or replace function public.record_editorial_email_event(
  p_idempotency_key text, p_event_type text, p_provider_id text default null,
  p_error_code text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_event uuid;
begin
  if not public.can_manage_editorial() then raise exception 'Forbidden'; end if;
  if p_event_type not in ('sent','delivered','bounced','opened','clicked','failed','retrying')
    then raise exception 'Invalid email event'; end if;
  update public.editorial_email_events set
    event_type=p_event_type,provider_id=coalesce(p_provider_id,provider_id),
    error_code=p_error_code,created_at=now()
  where idempotency_key=p_idempotency_key returning id into v_event;
  if v_event is null then raise exception 'Email event not found'; end if;
  return v_event;
end;
$$;

alter table public.user_roles enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.learning_contents enable row level security;
alter table public.learning_content_versions enable row level security;
alter table public.content_references enable row level security;
alter table public.learning_content_version_references enable row level security;
alter table public.content_reviews enable row level security;
alter table public.editorial_audit_events enable row level security;
alter table public.content_review_requests enable row level security;
alter table public.editorial_notifications enable row level security;
alter table public.editorial_email_events enable row level security;
alter table public.content_generation_jobs enable row level security;
alter table public.plan_item_material_versions enable row level security;

create policy user_roles_read_own on public.user_roles for select to authenticated
using (user_id=(select auth.uid()) or public.has_app_role('admin'));
create policy mentor_profiles_staff on public.mentor_profiles for select to authenticated
using (
  user_id=(select auth.uid()) or public.can_manage_editorial()
  or authorization_status='authorized'
);
create policy learning_contents_staff on public.learning_contents for select to authenticated
using (
  public.can_manage_editorial()
  or assigned_mentor_id=(select auth.uid())
  or exists (
    select 1 from public.learning_content_versions v
    where v.id=current_published_version_id and v.editorial_status='published'
  )
);
create policy learning_versions_visible on public.learning_content_versions for select to authenticated
using (
  editorial_status='published' or public.can_manage_editorial()
  or exists (
    select 1 from public.learning_contents c
    where c.id=content_id and c.assigned_mentor_id=(select auth.uid())
  )
);
create policy references_visible on public.content_references for select to authenticated
using (
  verification_status='verified' or public.can_manage_editorial()
  or public.has_app_role('mentor')
);
create policy version_references_visible on public.learning_content_version_references
for select to authenticated using (
  exists (
    select 1 from public.learning_content_versions v
    where v.id=version_id and (
      v.editorial_status='published' or public.can_manage_editorial()
      or exists (
        select 1 from public.learning_contents c
        where c.id=v.content_id and c.assigned_mentor_id=(select auth.uid())
      )
    )
  )
);
create policy reviews_staff on public.content_reviews for select to authenticated
using (mentor_id=(select auth.uid()) or public.can_manage_editorial());
create policy audit_staff on public.editorial_audit_events for select to authenticated
using (public.can_manage_editorial() or actor_id=(select auth.uid()));
create policy requests_own_or_staff on public.content_review_requests for select to authenticated
using (student_id=(select auth.uid()) or public.can_manage_editorial() or public.has_app_role('mentor'));
create policy notifications_own on public.editorial_notifications for select to authenticated
using (recipient_id=(select auth.uid()));
create policy emails_staff on public.editorial_email_events for select to authenticated
using (public.can_manage_editorial() or recipient_id=(select auth.uid()));
create policy jobs_staff on public.content_generation_jobs for select to authenticated
using (public.can_manage_editorial());
create policy plan_material_own on public.plan_item_material_versions for select to authenticated
using (
  exists (
    select 1
    from public.study_plan_items i
    join public.study_plan_versions v on v.id=i.plan_version_id
    join public.study_plans p on p.id=v.plan_id
    where i.id=plan_item_id and p.student_id=(select auth.uid())
  )
);

revoke all on public.user_roles,public.mentor_profiles,public.learning_contents,
  public.learning_content_versions,public.content_references,
  public.learning_content_version_references,public.content_reviews,
  public.editorial_audit_events,public.content_review_requests,
  public.editorial_notifications,public.editorial_email_events,
  public.content_generation_jobs,public.plan_item_material_versions from anon;
grant select on public.user_roles,public.mentor_profiles,public.learning_contents,
  public.learning_content_versions,public.content_references,
  public.learning_content_version_references,public.content_reviews,
  public.editorial_audit_events,public.content_review_requests,
  public.editorial_notifications,public.editorial_email_events,
  public.content_generation_jobs,public.plan_item_material_versions to authenticated;
revoke insert,update,delete on public.user_roles,public.mentor_profiles,
  public.learning_contents,public.learning_content_versions,
  public.content_references,public.learning_content_version_references,
  public.content_reviews,public.editorial_audit_events,
  public.content_review_requests,public.editorial_notifications,
  public.editorial_email_events,public.content_generation_jobs,
  public.plan_item_material_versions from authenticated;
grant execute on function public.has_app_role(text) to authenticated;
grant execute on function public.can_manage_editorial() to authenticated;
grant execute on function public.create_learning_content_draft(
  text,text,text,text,smallint,jsonb,jsonb,jsonb,text,jsonb,jsonb,text,uuid,uuid,
  boolean,text,text,boolean,text
) to authenticated;
grant execute on function public.create_learning_content_version(
  uuid,uuid,text,text,jsonb,text
) to authenticated;
grant execute on function public.submit_content_for_review(uuid,uuid,text) to authenticated;
grant execute on function public.review_learning_content(
  uuid,text,text,text,text,text
) to authenticated;
grant execute on function public.publish_learning_content(uuid,text) to authenticated;
grant execute on function public.request_content_review_priority(uuid,text) to authenticated;
grant execute on function public.review_assignment_email_payload(uuid) to authenticated;
grant execute on function public.record_editorial_email_event(text,text,text,text) to authenticated;

comment on table public.learning_content_versions is
'Immutable, structured teaching material versions. AI output remains a draft until human review and publication.';
comment on table public.editorial_audit_events is
'Append-only audit trail for editorial actions; never stores full clinical content.';

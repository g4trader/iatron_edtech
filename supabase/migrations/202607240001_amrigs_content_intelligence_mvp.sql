alter table public.questions
  add constraint questions_editorial_status_check
  check (status in (
    'draft','editorial_review','medical_review','source_validation',
    'answer_key_validation','pending_homologation','homologated','published',
    'suspended','correction_pending','superseded','rejected'
  ));

alter table public.question_versions
  add constraint question_versions_editorial_status_check
  check (status in (
    'draft','editorial_review','medical_review','source_validation',
    'answer_key_validation','pending_homologation','homologated','published',
    'suspended','correction_pending','superseded','rejected'
  ));

create table public.content_import_batches (
  id uuid primary key default gen_random_uuid(),
  import_key text not null unique check (import_key ~ '^AMRIGS:[A-Z0-9_.-]+$'),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  board_code text not null check (board_code = 'AMRIGS'),
  source_kind text not null check (source_kind in ('authorial_validation','licensed_exam')),
  status text not null default 'processing' check (status in ('processing','completed','failed')),
  question_count integer not null default 0 check (question_count >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error_message text,
  created_by text not null,
  check ((status = 'completed') = (completed_at is not null))
);
create index content_import_batches_status_started_idx
  on public.content_import_batches(status, started_at desc);

create table public.question_version_provenance (
  id uuid primary key default gen_random_uuid(),
  question_version_id uuid not null unique references public.question_versions(id) on delete cascade,
  import_batch_id uuid references public.content_import_batches(id) on delete restrict,
  content_type text not null default 'question' check (content_type = 'question'),
  origin text not null,
  source_title text not null,
  source_url text check (source_url is null or source_url ~ '^https?://'),
  rights_holder text not null,
  legal_basis text not null,
  external_identifier text not null,
  obtained_on date not null,
  authorship_kind text not null check (authorship_kind in (
    'mentor_authored','mentor_reviewed','medical_team_homologated',
    'editorial_non_homologated','ai_from_homologated','provisional'
  )),
  author_name text,
  reviewer_name text,
  homologator_name text,
  provenance_version integer not null default 1 check (provenance_version > 0),
  effective_from date,
  effective_until date,
  editorial_status text not null check (editorial_status in (
    'draft','editorial_review','medical_review','source_validation',
    'answer_key_validation','pending_homologation','homologated','published',
    'suspended','correction_pending','superseded','rejected'
  )),
  responsible_party text not null,
  usage_restrictions text[] not null default '{}',
  correction_history jsonb not null default '[]'::jsonb check (jsonb_typeof(correction_history) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (origin, external_identifier, provenance_version),
  check (effective_until is null or effective_from is null or effective_until >= effective_from),
  check (editorial_status <> 'published' or authorship_kind in (
    'mentor_authored','mentor_reviewed','medical_team_homologated','ai_from_homologated'
  ))
);
create index question_version_provenance_batch_idx
  on public.question_version_provenance(import_batch_id);
create index question_version_provenance_status_idx
  on public.question_version_provenance(editorial_status);
create trigger question_version_provenance_set_updated_at
  before update on public.question_version_provenance
  for each row execute function public.set_updated_at();

alter table public.content_import_batches enable row level security;
alter table public.question_version_provenance enable row level security;
create policy content_import_batches_read_authenticated
  on public.content_import_batches for select to authenticated using (true);
create policy question_version_provenance_read_authenticated
  on public.question_version_provenance for select to authenticated using (true);
revoke all on public.content_import_batches, public.question_version_provenance
  from anon, authenticated;
grant select on public.content_import_batches, public.question_version_provenance
  to authenticated;

create or replace function public.import_amrigs_content(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_batch_id uuid;
  v_existing_hash text;
  v_payload_hash text := encode(digest(p_payload::text, 'sha256'), 'hex');
  v_exam_id uuid := (p_payload->>'examEditionId')::uuid;
  v_item jsonb;
  v_question_id uuid;
  v_question_source_key text;
  v_question_hash text;
  v_version_id uuid;
  v_competency_code text;
  v_competency_id uuid;
  v_area_code text;
  v_option jsonb;
begin
  if p_payload->>'boardCode' <> 'AMRIGS' then
    raise exception 'Only the AMRIGS pilot is supported';
  end if;
  if p_payload->>'sourceKind' not in ('authorial_validation','licensed_exam') then
    raise exception 'Unsupported source kind';
  end if;
  if jsonb_typeof(p_payload->'questions') <> 'array'
     or jsonb_array_length(p_payload->'questions') < 1
     or jsonb_array_length(p_payload->'questions') > 20 then
    raise exception 'MVP batches require between 1 and 20 questions';
  end if;
  if (
    select count(*) <> count(distinct item->>'sourceKey')
        or count(*) <> count(distinct item->>'canonicalHash')
    from jsonb_array_elements(p_payload->'questions') item
  ) then
    raise exception 'Duplicate source key or canonical content in payload';
  end if;
  if not exists (
    select 1
    from public.exam_editions e
    join public.exam_programs p on p.id = e.exam_program_id
    where e.id = v_exam_id and p.code = 'AMRIGS'
  ) then
    raise exception 'Exam edition does not belong to AMRIGS';
  end if;

  select id, payload_hash into v_batch_id, v_existing_hash
  from public.content_import_batches
  where import_key = p_payload->>'importKey';
  if v_batch_id is not null then
    if v_existing_hash <> v_payload_hash then
      raise exception 'Import key already exists with a different payload';
    end if;
    return v_batch_id;
  end if;

  insert into public.content_import_batches
    (import_key,payload_hash,board_code,source_kind,status,created_by)
  values
    (p_payload->>'importKey',v_payload_hash,'AMRIGS',p_payload->>'sourceKind','processing',p_payload->>'createdBy')
  returning id into v_batch_id;

  for v_item in select value from jsonb_array_elements(p_payload->'questions')
  loop
    if v_item->>'editorialStatus' <> 'draft' then
      raise exception 'MVP imports must remain draft until editorial approval';
    end if;
    if v_item->>'canonicalHash' !~ '^[a-f0-9]{64}$' then
      raise exception 'Invalid canonical hash';
    end if;

    select id, source_key, canonical_hash
      into v_question_id, v_question_source_key, v_question_hash
    from public.questions
    where source_key = v_item->>'sourceKey'
       or canonical_hash = v_item->>'canonicalHash'
    order by (source_key = v_item->>'sourceKey') desc
    limit 1;

    if v_question_id is null then
      insert into public.questions(source_key,canonical_hash,status)
      values(v_item->>'sourceKey',v_item->>'canonicalHash','draft')
      returning id into v_question_id;
    elsif v_question_source_key is distinct from v_item->>'sourceKey'
       or v_question_hash is distinct from v_item->>'canonicalHash' then
      raise exception 'Source key or canonical content collides with an existing question';
    end if;

    select id into v_version_id
    from public.question_versions
    where question_id = v_question_id and version = 1;

    if v_version_id is null then
      insert into public.question_versions
        (question_id,version,institution_id,stem,commentary,difficulty,cognitive_level,status,change_note)
      values
        (v_question_id,1,(v_item->>'institutionId')::uuid,v_item->>'stem',
         v_item->>'commentary',(v_item->>'difficulty')::smallint,
         v_item->>'cognitiveLevel','draft','AMRIGS Content Intelligence MVP import')
      returning id into v_version_id;

      for v_option in select value from jsonb_array_elements(v_item->'options')
      loop
        insert into public.question_options
          (question_version_id,label,content,is_correct,position)
        values
          (v_version_id,v_option->>'label',v_option->>'content',
           (v_option->>'isCorrect')::boolean,(v_option->>'position')::smallint);
      end loop;
    end if;

    v_area_code := v_item->>'areaCode';
    if not exists (select 1 from public.medical_areas where code = v_area_code) then
      raise exception 'Unknown area code %', v_area_code;
    end if;

    for v_competency_code in
      select jsonb_array_elements_text(v_item->'competencyCodes')
    loop
      select c.id into v_competency_id
      from public.competencies c
      join public.subthemes s on s.id = c.subtheme_id
      join public.themes t on t.id = s.theme_id
      join public.medical_areas a on a.id = t.area_id
      where c.code = v_competency_code and a.code = v_area_code;
      if v_competency_id is null then
        raise exception 'Competency % does not belong to area %', v_competency_code, v_area_code;
      end if;
      insert into public.question_version_competencies(question_version_id,competency_id,relevance)
      values(v_version_id,v_competency_id,1)
      on conflict (question_version_id,competency_id) do nothing;
    end loop;

    insert into public.exam_questions(exam_edition_id,question_id,question_version_id,position)
    values(v_exam_id,v_question_id,v_version_id,(v_item->>'position')::smallint)
    on conflict (exam_edition_id,question_id) do update
      set question_version_id=excluded.question_version_id,position=excluded.position;

    insert into public.question_version_provenance
      (question_version_id,import_batch_id,origin,source_title,source_url,
       rights_holder,legal_basis,external_identifier,obtained_on,authorship_kind,
       author_name,provenance_version,editorial_status,responsible_party,
       usage_restrictions)
    values
      (v_version_id,v_batch_id,v_item#>>'{provenance,origin}',
       v_item#>>'{provenance,sourceTitle}',nullif(v_item#>>'{provenance,sourceUrl}',''),
       v_item#>>'{provenance,rightsHolder}',v_item#>>'{provenance,legalBasis}',
       v_item#>>'{provenance,externalIdentifier}',
       (v_item#>>'{provenance,obtainedOn}')::date,
       v_item#>>'{provenance,authorshipKind}',
       nullif(v_item#>>'{provenance,authorName}',''),1,'draft',
       v_item#>>'{provenance,responsibleParty}',
       array(select jsonb_array_elements_text(v_item#>'{provenance,usageRestrictions}')))
    on conflict (question_version_id) do nothing;
  end loop;

  update public.content_import_batches
  set status='completed',
      question_count=jsonb_array_length(p_payload->'questions'),
      completed_at=now()
  where id=v_batch_id;
  return v_batch_id;
end;
$$;

revoke all on function public.import_amrigs_content(jsonb)
  from public, anon, authenticated;
grant execute on function public.import_amrigs_content(jsonb) to service_role;

create view public.amrigs_content_metadata
with (security_invoker = true)
as
select
  e.id as exam_edition_id,
  e.year,
  e.edition,
  p.code as program_code,
  count(distinct eq.question_id)::integer as question_count,
  count(distinct qv.id) filter (where qv.status = 'published')::integer as published_count,
  count(distinct qv.id) filter (where qv.status <> 'published')::integer as non_published_count,
  count(distinct qvp.id)::integer as provenance_count,
  count(distinct qvc.competency_id)::integer as competency_count
from public.exam_editions e
join public.exam_programs p on p.id=e.exam_program_id and p.code='AMRIGS'
left join public.exam_questions eq on eq.exam_edition_id=e.id
left join public.question_versions qv on qv.id=eq.question_version_id
left join public.question_version_provenance qvp on qvp.question_version_id=qv.id
left join public.question_version_competencies qvc on qvc.question_version_id=qv.id
group by e.id,e.year,e.edition,p.code;

revoke all on public.amrigs_content_metadata from anon, authenticated;
grant select on public.amrigs_content_metadata to authenticated;

comment on table public.content_import_batches is 'Idempotent AMRIGS-only content import audit record.';
comment on table public.question_version_provenance is 'Editorial and legal provenance for a question version.';
comment on function public.import_amrigs_content(jsonb) is 'Administrative AMRIGS MVP import; not callable by students.';

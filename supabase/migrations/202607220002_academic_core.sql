create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_]+$'),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.medical_areas (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_]+$'),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.program_specialties (
  exam_program_id uuid not null references public.exam_programs(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (exam_program_id, specialty_id)
);
create index program_specialties_specialty_idx on public.program_specialties(specialty_id);

create table public.specialty_areas (
  specialty_id uuid not null references public.specialties(id) on delete cascade,
  area_id uuid not null references public.medical_areas(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (specialty_id, area_id)
);
create index specialty_areas_area_idx on public.specialty_areas(area_id);

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references public.medical_areas(id) on delete restrict,
  code text not null unique check (code ~ '^[A-Z0-9_]+$'),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (area_id, name)
);
create index themes_area_idx on public.themes(area_id);

create table public.subthemes (
  id uuid primary key default gen_random_uuid(),
  theme_id uuid not null references public.themes(id) on delete restrict,
  code text not null unique check (code ~ '^[A-Z0-9_]+$'),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (theme_id, name)
);
create index subthemes_theme_idx on public.subthemes(theme_id);

create table public.competencies (
  id uuid primary key default gen_random_uuid(),
  subtheme_id uuid not null references public.subthemes(id) on delete restrict,
  code text not null unique check (code ~ '^[A-Z0-9_.-]+$'),
  name text not null,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subtheme_id, name)
);
create index competencies_subtheme_idx on public.competencies(subtheme_id);

create table public.competency_objectives (
  id uuid primary key default gen_random_uuid(),
  competency_id uuid not null references public.competencies(id) on delete cascade,
  description text not null,
  position smallint not null check (position > 0),
  unique (competency_id, position)
);
create index competency_objectives_competency_idx on public.competency_objectives(competency_id);

create table public.academic_references (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text,
  publication_year smallint check (publication_year between 1800 and 2100),
  citation text,
  url text check (url is null or url ~ '^https?://'),
  external_identifier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (title, publication_year, external_identifier)
);

create table public.competency_references (
  competency_id uuid not null references public.competencies(id) on delete cascade,
  reference_id uuid not null references public.academic_references(id) on delete restrict,
  primary key (competency_id, reference_id)
);
create index competency_references_reference_idx on public.competency_references(reference_id);

create table public.guideline_issuers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  acronym text unique,
  url text check (url is null or url ~ '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guidelines (
  id uuid primary key default gen_random_uuid(),
  issuer_id uuid not null references public.guideline_issuers(id) on delete restrict,
  stable_key text not null,
  title text not null,
  version text not null,
  issued_on date,
  effective_from date,
  effective_until date,
  url text check (url is null or url ~ '^https?://'),
  notes text,
  status text not null default 'published' check (char_length(status) between 2 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stable_key, version),
  check (effective_until is null or effective_from is null or effective_until >= effective_from)
);
create index guidelines_issuer_idx on public.guidelines(issuer_id);
create index guidelines_effective_idx on public.guidelines(effective_from, effective_until);

create table public.guideline_competencies (
  guideline_id uuid not null references public.guidelines(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  primary key (guideline_id, competency_id)
);
create index guideline_competencies_competency_idx on public.guideline_competencies(competency_id);

create table public.guideline_specialties (
  guideline_id uuid not null references public.guidelines(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  primary key (guideline_id, specialty_id)
);
create index guideline_specialties_specialty_idx on public.guideline_specialties(specialty_id);

alter table public.exam_boards add column acronym text;
create unique index exam_boards_acronym_key on public.exam_boards(acronym) where acronym is not null;

alter table public.exam_editions
  add column exam_board_id uuid references public.exam_boards(id) on delete restrict,
  add column edition text,
  add column city text,
  add column modality text,
  add column duration_minutes smallint check (duration_minutes > 0),
  add column question_count smallint check (question_count > 0);
update public.exam_editions e set exam_board_id = p.exam_board_id from public.exam_programs p where p.id = e.exam_program_id;
create index exam_editions_board_idx on public.exam_editions(exam_board_id);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  source_key text unique,
  canonical_hash text not null unique check (canonical_hash ~ '^[a-f0-9]{64}$'),
  current_version integer not null default 1 check (current_version > 0),
  status text not null default 'draft' check (char_length(status) between 2 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index questions_status_idx on public.questions(status);

create table public.question_versions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  version integer not null check (version > 0),
  institution_id uuid references public.institutions(id) on delete restrict,
  stem text not null,
  commentary text,
  difficulty smallint check (difficulty between 1 and 5),
  cognitive_level text,
  status text not null default 'draft' check (char_length(status) between 2 and 40),
  change_note text,
  created_at timestamptz not null default now(),
  unique (question_id, version),
  unique (id, question_id)
);
create index question_versions_question_idx on public.question_versions(question_id);
create index question_versions_institution_idx on public.question_versions(institution_id);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  label text not null,
  content text not null,
  is_correct boolean not null default false,
  position smallint not null check (position > 0),
  unique (question_version_id, label),
  unique (question_version_id, position)
);
create unique index question_options_one_correct_idx on public.question_options(question_version_id) where is_correct;

create table public.question_assets (
  id uuid primary key default gen_random_uuid(),
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  asset_type text not null check (char_length(asset_type) between 2 and 40),
  storage_path text not null,
  alt_text text,
  position smallint not null default 1 check (position > 0),
  unique (question_version_id, storage_path)
);
create index question_assets_version_idx on public.question_assets(question_version_id);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null unique
);

create table public.question_version_tags (
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  primary key (question_version_id, tag_id)
);
create index question_version_tags_tag_idx on public.question_version_tags(tag_id);

create table public.question_version_competencies (
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete restrict,
  relevance numeric(3,2) not null default 1 check (relevance > 0 and relevance <= 1),
  primary key (question_version_id, competency_id)
);
create index question_version_competencies_competency_idx on public.question_version_competencies(competency_id);

create table public.question_version_themes (
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  theme_id uuid not null references public.themes(id) on delete restrict,
  primary key (question_version_id, theme_id)
);
create index question_version_themes_theme_idx on public.question_version_themes(theme_id);

create table public.question_version_subthemes (
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  subtheme_id uuid not null references public.subthemes(id) on delete restrict,
  primary key (question_version_id, subtheme_id)
);
create index question_version_subthemes_subtheme_idx on public.question_version_subthemes(subtheme_id);

create table public.question_version_specialties (
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  primary key (question_version_id, specialty_id)
);
create index question_version_specialties_specialty_idx on public.question_version_specialties(specialty_id);

create table public.question_version_programs (
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  exam_program_id uuid not null references public.exam_programs(id) on delete restrict,
  primary key (question_version_id, exam_program_id)
);
create index question_version_programs_program_idx on public.question_version_programs(exam_program_id);

create table public.question_version_guidelines (
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  guideline_id uuid not null references public.guidelines(id) on delete restrict,
  primary key (question_version_id, guideline_id)
);
create index question_version_guidelines_guideline_idx on public.question_version_guidelines(guideline_id);

create table public.question_version_references (
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  reference_id uuid not null references public.academic_references(id) on delete restrict,
  primary key (question_version_id, reference_id)
);
create index question_version_references_reference_idx on public.question_version_references(reference_id);

create table public.exam_questions (
  exam_edition_id uuid not null references public.exam_editions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  question_version_id uuid not null,
  position smallint not null check (position > 0),
  created_at timestamptz not null default now(),
  primary key (exam_edition_id, question_id),
  unique (exam_edition_id, position),
  foreign key (question_version_id, question_id) references public.question_versions(id, question_id) on delete restrict
);
create index exam_questions_question_idx on public.exam_questions(question_id);
create index exam_questions_version_idx on public.exam_questions(question_version_id);

create trigger specialties_set_updated_at before update on public.specialties for each row execute function public.set_updated_at();
create trigger medical_areas_set_updated_at before update on public.medical_areas for each row execute function public.set_updated_at();
create trigger themes_set_updated_at before update on public.themes for each row execute function public.set_updated_at();
create trigger subthemes_set_updated_at before update on public.subthemes for each row execute function public.set_updated_at();
create trigger competencies_set_updated_at before update on public.competencies for each row execute function public.set_updated_at();
create trigger academic_references_set_updated_at before update on public.academic_references for each row execute function public.set_updated_at();
create trigger guideline_issuers_set_updated_at before update on public.guideline_issuers for each row execute function public.set_updated_at();
create trigger guidelines_set_updated_at before update on public.guidelines for each row execute function public.set_updated_at();
create trigger questions_set_updated_at before update on public.questions for each row execute function public.set_updated_at();

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'specialties','medical_areas','program_specialties','specialty_areas','themes','subthemes',
    'competencies','competency_objectives','academic_references','competency_references',
    'guideline_issuers','guidelines','guideline_competencies','guideline_specialties','questions',
    'question_versions','question_options','question_assets','tags','question_version_tags',
    'question_version_competencies','question_version_themes','question_version_subthemes',
    'question_version_specialties','question_version_programs','question_version_guidelines',
    'question_version_references','exam_questions'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('create policy %I on public.%I for select to authenticated using (true)', table_name || '_read_authenticated', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to authenticated', table_name);
  end loop;
end $$;

revoke insert, update, delete on public.exam_boards, public.exam_editions from authenticated;
grant select on public.exam_boards, public.exam_editions to authenticated;

comment on table public.competencies is 'Smallest unit on which mastery may be measured.';
comment on table public.questions is 'Stable question identity used for deduplication and versioning.';
comment on table public.question_versions is 'Immutable versionable question content and classification anchor.';
comment on table public.exam_questions is 'Many-to-many exam composition pinned to a question version.';

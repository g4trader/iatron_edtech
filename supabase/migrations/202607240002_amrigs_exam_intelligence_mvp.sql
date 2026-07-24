create table public.exam_intelligence_profiles (
  id uuid primary key default gen_random_uuid(),
  exam_program_id uuid not null references public.exam_programs(id) on delete restrict,
  display_name text not null check (char_length(display_name) between 3 and 160),
  version integer not null check (version > 0),
  valid_from date not null,
  valid_until date,
  editorial_status text not null check (editorial_status in (
    'draft','editorial_review','medical_review','source_validation',
    'answer_key_validation','pending_homologation','homologated','published','suspended',
    'correction_pending','superseded','rejected'
  )),
  is_active boolean not null default false,
  analysis_period_start date,
  analysis_period_end date,
  exams_analyzed integer not null default 0 check (exams_analyzed >= 0),
  questions_analyzed integer not null default 0 check (questions_analyzed >= 0),
  coverage numeric(5,4) not null default 0 check (coverage between 0 and 1),
  confidence text not null check (confidence in ('insufficient','low','medium','high')),
  limitations text[] not null default '{}',
  source_title text not null,
  source_url text check (source_url is null or source_url ~ '^https?://'),
  source_origin text not null,
  responsible_editorial text not null,
  responsible_statistical text,
  notes text,
  method_version text not null,
  is_synthetic boolean not null,
  last_updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_program_id, version),
  check (valid_until is null or valid_until >= valid_from),
  check (
    analysis_period_end is null
    or analysis_period_start is null
    or analysis_period_end >= analysis_period_start
  ),
  check (
    not is_synthetic
    or (
      editorial_status = 'draft'
      and confidence = 'insufficient'
      and exams_analyzed = 0
      and questions_analyzed = 0
    )
  )
);
create unique index exam_intelligence_profiles_one_active_idx
  on public.exam_intelligence_profiles(exam_program_id)
  where is_active;
create index exam_intelligence_profiles_program_version_idx
  on public.exam_intelligence_profiles(exam_program_id, version desc);
create index exam_intelligence_profiles_validity_idx
  on public.exam_intelligence_profiles(valid_from, valid_until);

create table public.exam_blueprints (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.exam_intelligence_profiles(id) on delete cascade,
  version integer not null check (version > 0),
  is_active boolean not null default false,
  expected_question_count integer check (expected_question_count > 0),
  duration_minutes integer check (duration_minutes > 0),
  format_description text not null,
  correction_rules text not null,
  notes text,
  source_title text not null,
  source_url text check (source_url is null or source_url ~ '^https?://'),
  period_start date,
  period_end date,
  confidence text not null check (confidence in ('insufficient','low','medium','high')),
  editorial_status text not null check (editorial_status in (
    'draft','editorial_review','medical_review','source_validation',
    'answer_key_validation','pending_homologation','homologated','published','suspended',
    'correction_pending','superseded','rejected'
  )),
  is_synthetic boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, version),
  check (period_end is null or period_start is null or period_end >= period_start),
  check (
    not is_synthetic
    or (editorial_status = 'draft' and confidence = 'insufficient')
  )
);
create unique index exam_blueprints_one_active_idx
  on public.exam_blueprints(profile_id)
  where is_active;
create index exam_blueprints_profile_version_idx
  on public.exam_blueprints(profile_id, version desc);

create table public.exam_blueprint_areas (
  blueprint_id uuid not null references public.exam_blueprints(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  expected_proportion numeric(5,4) not null check (expected_proportion between 0 and 1),
  expected_question_count integer check (expected_question_count >= 0),
  weight numeric(8,4) check (weight is null or weight > 0),
  notes text,
  position smallint not null check (position > 0),
  primary key (blueprint_id, specialty_id),
  unique (blueprint_id, position)
);
create index exam_blueprint_areas_specialty_idx
  on public.exam_blueprint_areas(specialty_id);

create table public.exam_recurrence_statistics (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.exam_intelligence_profiles(id) on delete cascade,
  version integer not null check (version > 0),
  dimension_type text not null check (dimension_type in ('area','theme','subtheme','competency')),
  area_id uuid references public.medical_areas(id) on delete restrict,
  theme_id uuid references public.themes(id) on delete restrict,
  subtheme_id uuid references public.subthemes(id) on delete restrict,
  competency_id uuid references public.competencies(id) on delete restrict,
  dimension_key uuid generated always as (
    coalesce(area_id, theme_id, subtheme_id, competency_id)
  ) stored,
  period_start date,
  period_end date,
  sample_size integer not null check (sample_size >= 0),
  sample_unit text not null,
  occurrences integer not null check (occurrences >= 0),
  denominator integer not null check (denominator >= 0),
  coverage numeric(5,4) not null check (coverage between 0 and 1),
  relevance text not null check (relevance in ('insufficient','low','moderate','high')),
  confidence text not null check (confidence in ('insufficient','low','medium','high')),
  origin text not null,
  method_version text not null,
  missing_data text[] not null default '{}',
  limitations text[] not null default '{}',
  responsible_statistical text,
  editorial_status text not null check (editorial_status in (
    'draft','editorial_review','medical_review','source_validation',
    'answer_key_validation','pending_homologation','homologated','published','suspended',
    'correction_pending','superseded','rejected'
  )),
  is_synthetic boolean not null,
  last_updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (profile_id, version, dimension_type, dimension_key),
  check (period_end is null or period_start is null or period_end >= period_start),
  check (occurrences <= denominator),
  check (
    (dimension_type = 'area' and area_id is not null and theme_id is null and subtheme_id is null and competency_id is null)
    or (dimension_type = 'theme' and area_id is null and theme_id is not null and subtheme_id is null and competency_id is null)
    or (dimension_type = 'subtheme' and area_id is null and theme_id is null and subtheme_id is not null and competency_id is null)
    or (dimension_type = 'competency' and area_id is null and theme_id is null and subtheme_id is null and competency_id is not null)
  ),
  check (
    not is_synthetic
    or (
      editorial_status = 'draft'
      and relevance = 'insufficient'
      and confidence = 'insufficient'
    )
  )
);
create index exam_recurrence_statistics_profile_dimension_idx
  on public.exam_recurrence_statistics(profile_id, dimension_type, dimension_key);
create index exam_recurrence_statistics_profile_version_idx
  on public.exam_recurrence_statistics(profile_id, version desc);

create trigger exam_intelligence_profiles_set_updated_at
  before update on public.exam_intelligence_profiles
  for each row execute function public.set_updated_at();
create trigger exam_blueprints_set_updated_at
  before update on public.exam_blueprints
  for each row execute function public.set_updated_at();

alter table public.exam_intelligence_profiles enable row level security;
alter table public.exam_blueprints enable row level security;
alter table public.exam_blueprint_areas enable row level security;
alter table public.exam_recurrence_statistics enable row level security;

create policy exam_intelligence_profiles_read_authenticated
  on public.exam_intelligence_profiles for select to authenticated using (true);
create policy exam_blueprints_read_authenticated
  on public.exam_blueprints for select to authenticated using (true);
create policy exam_blueprint_areas_read_authenticated
  on public.exam_blueprint_areas for select to authenticated using (true);
create policy exam_recurrence_statistics_read_authenticated
  on public.exam_recurrence_statistics for select to authenticated using (true);

revoke all on public.exam_intelligence_profiles, public.exam_blueprints,
  public.exam_blueprint_areas, public.exam_recurrence_statistics
  from anon, authenticated;
grant select on public.exam_intelligence_profiles, public.exam_blueprints,
  public.exam_blueprint_areas, public.exam_recurrence_statistics
  to authenticated;

comment on table public.exam_intelligence_profiles is
  'Versioned and transparent exam profile; synthetic drafts are demonstrative only.';
comment on table public.exam_blueprints is
  'Versioned exam composition associated with an exam intelligence profile.';
comment on table public.exam_blueprint_areas is
  'Expected large-area distribution for one blueprint version.';
comment on table public.exam_recurrence_statistics is
  'Versioned aggregate evidence with explicit sample, period, coverage and uncertainty.';

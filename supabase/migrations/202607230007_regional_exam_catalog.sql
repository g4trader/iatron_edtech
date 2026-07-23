alter table public.exam_programs
  add column code text,
  add column scope text not null default 'institutional',
  add column region_code text,
  add column state_code char(2),
  add column city text;

alter table public.exam_programs
  add constraint exam_programs_code_format check (code is null or code ~ '^[A-Z0-9_-]+$'),
  add constraint exam_programs_scope_length check (char_length(scope) between 2 and 40),
  add constraint exam_programs_region_code_check check (region_code is null or region_code in ('N', 'NE', 'CO', 'SE', 'S')),
  add constraint exam_programs_state_code_check check (state_code is null or state_code ~ '^[A-Z]{2}$');

create unique index exam_programs_code_key on public.exam_programs(code) where code is not null;
create index exam_programs_region_state_idx on public.exam_programs(region_code, state_code, city);

alter table public.exam_editions
  add column status text not null default 'verified',
  add column official_url text,
  add column source_title text,
  add column source_url text,
  add column verified_at date,
  add column verification_status text not null default 'pending',
  add column update_method text,
  add column unconfirmed_fields text[] not null default '{}';

alter table public.exam_editions
  add constraint exam_editions_status_length check (char_length(status) between 2 and 40),
  add constraint exam_editions_official_url_check check (official_url is null or official_url ~ '^https?://'),
  add constraint exam_editions_source_url_check check (source_url is null or source_url ~ '^https?://'),
  add constraint exam_editions_verification_status_check check (verification_status in ('verified', 'partial', 'pending'));

create index exam_editions_status_idx on public.exam_editions(status, year desc);
create index exam_editions_verified_at_idx on public.exam_editions(verified_at desc);

create table public.exam_program_institutions (
  exam_program_id uuid not null references public.exam_programs(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete restrict,
  participation_role text not null default 'participant' check (char_length(participation_role) between 2 and 40),
  created_at timestamptz not null default now(),
  primary key (exam_program_id, institution_id)
);
create index exam_program_institutions_institution_idx on public.exam_program_institutions(institution_id);

alter table public.exam_program_institutions enable row level security;
create policy exam_program_institutions_catalog_read on public.exam_program_institutions
  for select to authenticated using (true);
revoke insert, update, delete on public.exam_program_institutions from anon, authenticated;
grant select on public.exam_program_institutions to authenticated;

comment on table public.exam_program_institutions is 'Institutions participating in a residency selection process without duplicating the process.';
comment on column public.exam_programs.region_code is 'IBGE macro-region code used for structured catalogue filters.';
comment on column public.exam_editions.unconfirmed_fields is 'Fields intentionally left unknown after primary-source verification.';

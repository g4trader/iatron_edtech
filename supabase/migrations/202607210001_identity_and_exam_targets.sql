create extension if not exists pgcrypto with schema extensions;

create type public.onboarding_status as enum ('not_started', 'in_progress', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 100),
  email text not null check (email = lower(email)),
  onboarding_status public.onboarding_status not null default 'not_started',
  onboarding_step smallint not null default 0 check (onboarding_step between 0 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'Public application identity associated one-to-one with auth.users.';
create index profiles_onboarding_status_idx on public.profiles(onboarding_status);

create table public.student_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  residency_year smallint check (residency_year between 1 and 6),
  graduation_year smallint check (graduation_year between 1950 and 2100),
  weekly_study_hours numeric(4,1) check (weekly_study_hours between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.student_profiles is 'Academic preferences owned by a student.';

create table public.student_availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  minutes_available smallint not null check (minutes_available between 0 and 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, weekday)
);
create index student_availability_user_id_idx on public.student_availability(user_id);
comment on table public.student_availability is 'Weekly study availability; weekday uses 0 Sunday through 6 Saturday.';

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  acronym text not null,
  state_code char(2) not null check (state_code ~ '^[A-Z]{2}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, state_code),
  unique (acronym, state_code)
);
create index institutions_active_idx on public.institutions(is_active) where is_active;
comment on table public.institutions is 'Reviewed catalogue of fictitious or real teaching institutions.';

create table public.exam_boards (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index exam_boards_active_idx on public.exam_boards(is_active) where is_active;

create table public.exam_programs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  exam_board_id uuid references public.exam_boards(id) on delete restrict,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (institution_id, name)
);
create index exam_programs_institution_idx on public.exam_programs(institution_id);
create index exam_programs_board_idx on public.exam_programs(exam_board_id);
create index exam_programs_active_idx on public.exam_programs(is_active) where is_active;

create table public.exam_editions (
  id uuid primary key default gen_random_uuid(),
  exam_program_id uuid not null references public.exam_programs(id) on delete cascade,
  year smallint not null check (year between 2000 and 2100),
  application_date date,
  registration_deadline date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_program_id, year),
  check (registration_deadline is null or application_date is null or registration_deadline <= application_date)
);
create index exam_editions_program_idx on public.exam_editions(exam_program_id);
create index exam_editions_active_idx on public.exam_editions(is_active) where is_active;

create table public.student_target_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exam_edition_id uuid not null references public.exam_editions(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (user_id, exam_edition_id)
);
create index student_target_exams_user_id_idx on public.student_target_exams(user_id);
create index student_target_exams_edition_idx on public.student_target_exams(exam_edition_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger student_profiles_set_updated_at before update on public.student_profiles for each row execute function public.set_updated_at();
create trigger student_availability_set_updated_at before update on public.student_availability for each row execute function public.set_updated_at();
create trigger institutions_set_updated_at before update on public.institutions for each row execute function public.set_updated_at();
create trigger exam_boards_set_updated_at before update on public.exam_boards for each row execute function public.set_updated_at();
create trigger exam_programs_set_updated_at before update on public.exam_programs for each row execute function public.set_updated_at();
create trigger exam_editions_set_updated_at before update on public.exam_editions for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  requested_name text;
begin
  requested_name := trim(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)));
  if char_length(requested_name) < 2 then requested_name := 'Estudante'; end if;
  insert into public.profiles (id, display_name, email)
  values (new.id, left(requested_name, 100), lower(new.email));
  insert into public.student_profiles (user_id) values (new.id);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.student_availability enable row level security;
alter table public.institutions enable row level security;
alter table public.exam_boards enable row level security;
alter table public.exam_programs enable row level security;
alter table public.exam_editions enable row level security;
alter table public.student_target_exams enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy student_profiles_own on public.student_profiles for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy student_availability_own on public.student_availability for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy student_target_exams_own on public.student_target_exams for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy institutions_read_active on public.institutions for select to authenticated using (is_active);
create policy exam_boards_read_active on public.exam_boards for select to authenticated using (is_active);
create policy exam_programs_read_active on public.exam_programs for select to authenticated using (
  is_active and exists (select 1 from public.institutions i where i.id = institution_id and i.is_active)
);
create policy exam_editions_read_active on public.exam_editions for select to authenticated using (
  is_active and exists (select 1 from public.exam_programs p where p.id = exam_program_id and p.is_active)
);

revoke all on all tables in schema public from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.student_profiles, public.student_availability, public.student_target_exams to authenticated;
grant select on public.institutions, public.exam_boards, public.exam_programs, public.exam_editions to authenticated;

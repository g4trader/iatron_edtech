create or replace function public.save_onboarding(
  p_step smallint,
  p_display_name text default null,
  p_residency_year smallint default null,
  p_graduation_year smallint default null,
  p_experience_level text default null,
  p_preferred_session_minutes smallint default null,
  p_assessment_preference text default null,
  p_availability jsonb default null,
  p_exam_edition_ids uuid[] default null,
  p_complete boolean default false
) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_step not between 1 and 4 then raise exception 'invalid step' using errcode = '22023'; end if;
  if p_display_name is not null and char_length(trim(p_display_name)) not between 2 and 100 then raise exception 'invalid display name' using errcode = '22023'; end if;
  if p_residency_year is not null and p_residency_year not between 1 and 6 then raise exception 'invalid residency year' using errcode = '22023'; end if;
  if p_graduation_year is not null and p_graduation_year not between 1950 and 2100 then raise exception 'invalid graduation year' using errcode = '22023'; end if;
  if p_experience_level is not null and p_experience_level not in ('medical_student', 'recent_graduate', 'practicing_physician') then raise exception 'invalid experience level' using errcode = '22023'; end if;
  if p_preferred_session_minutes is not null and p_preferred_session_minutes not between 15 and 180 then raise exception 'invalid session duration' using errcode = '22023'; end if;
  if p_assessment_preference is not null and p_assessment_preference not in ('guided', 'independent', 'mixed') then raise exception 'invalid assessment preference' using errcode = '22023'; end if;
  if p_display_name is not null then update public.profiles set display_name = trim(p_display_name) where id = uid; end if;
  if p_residency_year is not null or p_graduation_year is not null or p_experience_level is not null or p_preferred_session_minutes is not null or p_assessment_preference is not null then
    update public.student_profiles set residency_year = coalesce(p_residency_year, residency_year), graduation_year = coalesce(p_graduation_year, graduation_year), experience_level = coalesce(p_experience_level, experience_level), preferred_session_minutes = coalesce(p_preferred_session_minutes, preferred_session_minutes), assessment_preference = coalesce(p_assessment_preference, assessment_preference) where user_id = uid;
  end if;
  if p_availability is not null then
    if jsonb_typeof(p_availability) <> 'array' or jsonb_array_length(p_availability) > 7 then raise exception 'invalid availability' using errcode = '22023'; end if;
    delete from public.student_availability where user_id = uid;
    insert into public.student_availability (user_id, weekday, minutes_available)
    select uid, (item->>'weekday')::smallint, (item->>'minutesAvailable')::smallint from jsonb_array_elements(p_availability) item;
  end if;
  if p_exam_edition_ids is not null then
    if cardinality(p_exam_edition_ids) > 20 then raise exception 'too many exam editions' using errcode = '22023'; end if;
    if exists (select 1 from unnest(p_exam_edition_ids) requested(id) left join public.exam_editions e on e.id = requested.id and e.is_active where e.id is null) then
      raise exception 'inactive or unknown exam edition' using errcode = '22023';
    end if;
    delete from public.student_target_exams where user_id = uid;
    insert into public.student_target_exams (user_id, exam_edition_id) select uid, id from unnest(p_exam_edition_ids) id on conflict do nothing;
  end if;
  update public.profiles set onboarding_step = greatest(onboarding_step, p_step), onboarding_status = case when p_complete then 'completed'::public.onboarding_status else 'in_progress'::public.onboarding_status end where id = uid;
end;
$$;
revoke all on function public.save_onboarding(smallint, text, smallint, smallint, text, smallint, text, jsonb, uuid[], boolean) from public, anon;
grant execute on function public.save_onboarding(smallint, text, smallint, smallint, text, smallint, text, jsonb, uuid[], boolean) to authenticated;
comment on function public.save_onboarding(smallint, text, smallint, smallint, text, smallint, text, jsonb, uuid[], boolean) is 'Atomic privileged onboarding write. Derives ownership from auth.uid, validates inputs and is executable only by authenticated users.';

create or replace function public.save_onboarding(
  p_step smallint,
  p_display_name text default null,
  p_residency_year smallint default null,
  p_graduation_year smallint default null,
  p_availability jsonb default null,
  p_exam_edition_ids uuid[] default null,
  p_complete boolean default false
) returns void language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'authentication required' using errcode = '42501'; end if;
  if p_step not between 1 and 4 then raise exception 'invalid step' using errcode = '22023'; end if;
  if p_display_name is not null then update public.profiles set display_name = p_display_name where id = uid; end if;
  if p_residency_year is not null or p_graduation_year is not null then
    update public.student_profiles set residency_year = coalesce(p_residency_year, residency_year), graduation_year = coalesce(p_graduation_year, graduation_year) where user_id = uid;
  end if;
  if p_availability is not null then
    delete from public.student_availability where user_id = uid;
    insert into public.student_availability (user_id, weekday, minutes_available)
    select uid, (item->>'weekday')::smallint, (item->>'minutesAvailable')::smallint from jsonb_array_elements(p_availability) item;
  end if;
  if p_exam_edition_ids is not null then
    if exists (select 1 from unnest(p_exam_edition_ids) requested(id) left join public.exam_editions e on e.id = requested.id and e.is_active where e.id is null) then
      raise exception 'inactive or unknown exam edition' using errcode = '22023';
    end if;
    delete from public.student_target_exams where user_id = uid;
    insert into public.student_target_exams (user_id, exam_edition_id) select uid, id from unnest(p_exam_edition_ids) id on conflict do nothing;
  end if;
  update public.profiles set onboarding_step = greatest(onboarding_step, p_step), onboarding_status = case when p_complete then 'completed'::public.onboarding_status else 'in_progress'::public.onboarding_status end where id = uid;
end;
$$;
revoke all on function public.save_onboarding(smallint, text, smallint, smallint, jsonb, uuid[], boolean) from public, anon;
grant execute on function public.save_onboarding(smallint, text, smallint, smallint, jsonb, uuid[], boolean) to authenticated;

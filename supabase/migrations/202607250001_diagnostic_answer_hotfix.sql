-- A derived Learning DNA snapshot must never abort the primary learning event.
-- Current Learning DNA remains reproducible from question_attempts and
-- learning_events; historical snapshots can be backfilled after the trigger
-- implementation is corrected independently.
drop trigger if exists question_attempts_capture_learning_dna
  on public.question_attempts;

comment on function public.capture_learning_dna_snapshot() is
  'Temporarily detached from question_attempts after it aborted diagnostic answers. Learning DNA remains derived from append-only attempts and events.';

-- Preserve the implementation installed by Diagnostic Engine 2.0 behind an
-- idempotent ownership-aware entry point.
alter function public.answer_diagnostic_question(
  uuid, uuid, uuid, integer, text
) rename to answer_diagnostic_question_once;

revoke all on function public.answer_diagnostic_question_once(
  uuid, uuid, uuid, integer, text
) from public, anon, authenticated;

create function public.answer_diagnostic_question(
  p_assessment_id uuid,
  p_question_version_id uuid,
  p_selected_option_id uuid,
  p_response_time_ms integer,
  p_stated_confidence text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_attempt uuid;
begin
  if v_student is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select qa.id
  into v_attempt
  from public.question_attempts qa
  join public.diagnostic_assessments da
    on da.id = qa.assessment_id
  where qa.assessment_id = p_assessment_id
    and qa.question_version_id = p_question_version_id
    and da.student_id = v_student;

  if v_attempt is not null then
    return v_attempt;
  end if;

  begin
    return public.answer_diagnostic_question_once(
      p_assessment_id,
      p_question_version_id,
      p_selected_option_id,
      p_response_time_ms,
      p_stated_confidence
    );
  exception
    when unique_violation then
      select qa.id
      into v_attempt
      from public.question_attempts qa
      join public.diagnostic_assessments da
        on da.id = qa.assessment_id
      where qa.assessment_id = p_assessment_id
        and qa.question_version_id = p_question_version_id
        and da.student_id = v_student;

      if v_attempt is null then
        raise;
      end if;
      return v_attempt;
  end;
end;
$$;

revoke all on function public.answer_diagnostic_question(
  uuid, uuid, uuid, integer, text
) from public, anon;
grant execute on function public.answer_diagnostic_question(
  uuid, uuid, uuid, integer, text
) to authenticated;

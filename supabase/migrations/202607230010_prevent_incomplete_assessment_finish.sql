create or replace function public.finish_diagnostic_assessment(
  p_assessment_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := auth.uid();
  v_result uuid;
  v_answered integer;
  v_required integer;
  v_correct integer;
  v_total integer;
  v_measured integer;
  v_conf numeric;
  v_coverage numeric;
begin
  select question_count
  into v_required
  from public.diagnostic_assessments
  where id = p_assessment_id
    and student_id = v_student
    and status = 'active';

  if not found then
    raise exception 'active assessment not found' using errcode = '42501';
  end if;

  select count(*), count(*) filter (where is_correct)
  into v_answered, v_correct
  from public.question_attempts
  where assessment_id = p_assessment_id;

  if v_answered < v_required then
    raise exception 'assessment incomplete: % of % questions answered',
      v_answered, v_required
      using errcode = '22023';
  end if;

  select count(*)
  into v_total
  from public.assessment_competencies
  where assessment_id = p_assessment_id;

  select
    count(*) filter (where coalesce(cm.evidence_count, 0) > 0),
    coalesce(
      avg(
        public.calculate_diagnostic_confidence(
          v_student,
          ac.competency_id,
          now()
        )
      ),
      0
    )
  into v_measured, v_conf
  from public.assessment_competencies ac
  left join public.current_mastery cm
    on cm.student_id = v_student
    and cm.competency_id = ac.competency_id
  where ac.assessment_id = p_assessment_id;

  v_coverage := case
    when v_total = 0 then 0
    else v_measured::numeric / v_total
  end;

  update public.diagnostic_assessments
  set
    status = 'completed',
    completed_at = now(),
    overall_confidence = v_conf,
    diagnostic_coverage = v_coverage
  where id = p_assessment_id;

  insert into public.assessment_results (
    assessment_id,
    student_id,
    correct_count,
    answered_count,
    overall_confidence,
    diagnostic_coverage,
    algorithm_version
  )
  values (
    p_assessment_id,
    v_student,
    v_correct,
    v_answered,
    v_conf,
    v_coverage,
    'assessment-v1'
  )
  returning id into v_result;

  insert into public.assessment_result_competencies (
    assessment_result_id,
    competency_id,
    mastery,
    confidence,
    confidence_level,
    evidence_count,
    classification
  )
  select
    v_result,
    ac.competency_id,
    coalesce(cm.mastery, 0),
    public.calculate_diagnostic_confidence(
      v_student,
      ac.competency_id,
      now()
    ),
    case
      when public.calculate_diagnostic_confidence(
        v_student,
        ac.competency_id,
        now()
      ) >= 0.7 then 'high'
      when public.calculate_diagnostic_confidence(
        v_student,
        ac.competency_id,
        now()
      ) >= 0.4 then 'medium'
      else 'low'
    end,
    coalesce(cm.evidence_count, 0),
    case
      when coalesce(cm.evidence_count, 0) = 0 then 'unmeasured'
      when cm.mastery >= 0.75 then 'strong'
      when cm.mastery < 0.5 then 'weak'
      else 'developing'
    end
  from public.assessment_competencies ac
  left join public.current_mastery cm
    on cm.student_id = v_student
    and cm.competency_id = ac.competency_id
  where ac.assessment_id = p_assessment_id;

  perform public.record_learning_event(
    v_student,
    'AssessmentFinished',
    now(),
    jsonb_build_object(
      'assessmentId', p_assessment_id,
      'answered', v_answered,
      'correct', v_correct,
      'coverage', v_coverage
    ),
    'assessment:' || p_assessment_id || ':finished',
    1::smallint
  );

  return v_result;
end;
$$;

create or replace function public.record_learning_event(
  p_student_id uuid, p_event_type text, p_occurred_at timestamptz,
  p_payload jsonb, p_idempotency_key text, p_schema_version integer
) returns uuid language sql security definer set search_path = '' as $$
  select public.record_learning_event(
    p_student_id, p_event_type, p_occurred_at, p_payload,
    p_idempotency_key, p_schema_version::smallint
  );
$$;
revoke all on function public.record_learning_event(uuid,text,timestamptz,jsonb,text,integer) from public,anon,authenticated;
grant execute on function public.record_learning_event(uuid,text,timestamptz,jsonb,text,integer) to service_role;

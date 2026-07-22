create or replace function public.prevent_learning_history_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old;
  end if;
  raise exception 'learning history is append-only' using errcode = '55000';
end;
$$;

comment on function public.prevent_learning_history_mutation() is
  'Blocks direct history mutation while allowing cascaded account deletion.';

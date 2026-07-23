alter table public.tutor_generations
add column estimated_cost_microusd bigint
check (estimated_cost_microusd is null or estimated_cost_microusd >= 0);

create function public.estimate_tutor_generation_cost()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.estimated_cost_microusd := case new.model
    when 'gpt-5.6-sol' then (new.input_tokens::bigint * 5) + (new.output_tokens::bigint * 30)
    when 'gpt-5.6-terra' then ((new.input_tokens::bigint * 5) + (new.output_tokens::bigint * 30)) / 2
    when 'gpt-5.6-luna' then (new.input_tokens::bigint * 1) + (new.output_tokens::bigint * 6)
    else null
  end;
  return new;
end $$;

create trigger tutor_generations_estimate_cost
before insert or update of model, input_tokens, output_tokens
on public.tutor_generations
for each row execute function public.estimate_tutor_generation_cost();

comment on column public.tutor_generations.estimated_cost_microusd is
  'Estimated standard-processing cost in micro-USD using the versioned model rate card current at 2026-07-23.';

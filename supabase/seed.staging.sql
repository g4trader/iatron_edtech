do $$
begin
  if current_setting('iatron.environment', true) is distinct from 'staging' then
    raise exception 'staging seed refused outside the approved staging job';
  end if;
end
$$;

\ir seed.sql
\ir migrations/202607230008_seed_south_region_catalog.sql

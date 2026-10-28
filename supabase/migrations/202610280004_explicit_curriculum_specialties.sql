-- New governed proposals have explicit specialty mappings. Preserve legacy inference.
-- Avoid a later seed/area association attaching adult competencies to Pediatrics.
create or replace function public.sync_competency_specialties()
returns trigger language plpgsql set search_path='' as $$
begin
 if tg_table_name='competencies' then
  if new.curriculum_status<>'legacy_unreviewed' then return new; end if;
  insert into public.competency_specialties(competency_id,specialty_id)
  select new.id,sa.specialty_id from public.subthemes st
  join public.themes t on t.id=st.theme_id
  join public.specialty_areas sa on sa.area_id=t.area_id
  where st.id=new.subtheme_id on conflict do nothing;
 else
  insert into public.competency_specialties(competency_id,specialty_id)
  select c.id,new.specialty_id from public.competencies c
  join public.subthemes st on st.id=c.subtheme_id
  join public.themes t on t.id=st.theme_id
  where t.area_id=new.area_id and c.curriculum_status='legacy_unreviewed'
  on conflict do nothing;
 end if;
 return new;
end $$;

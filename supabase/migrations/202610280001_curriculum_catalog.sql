-- Additive curricular governance. Existing identities and clinical approvals are unchanged.
alter table public.competencies
  add column curriculum_status text not null default 'legacy_unreviewed'
    check (curriculum_status in ('legacy_unreviewed','draft','pending_review')),
  add column curriculum_source text,
  add column search_terms text[] not null default '{}',
  add column curriculum_revision integer not null default 1 check (curriculum_revision > 0);
create unique index competencies_subtheme_normalized_name_idx on public.competencies(subtheme_id,lower(btrim(name)));
create index competencies_curriculum_status_idx on public.competencies(curriculum_status);

-- Restrict only newly-governed drafts; preserve visibility of every legacy row.
create policy curriculum_drafts_staff on public.competencies as restrictive
for select to authenticated using (
 curriculum_status='legacy_unreviewed' or public.can_manage_editorial()
 or (public.has_app_role('mentor') and exists(
  select 1 from public.competency_specialties cs where cs.competency_id=id
  and public.owns_medical_specialty(cs.specialty_id)
 ))
);
create policy curriculum_objectives_visible on public.competency_objectives as restrictive
for select to authenticated using (exists(
 select 1 from public.competencies c where c.id=competency_id
));

-- Internal projection: exposed only through the role-checked RPC below.
create view public.curriculum_catalog_rows as
select c.id,c.code,c.name,c.description,c.is_active as active,
 c.curriculum_status as status,c.curriculum_source as source,c.curriculum_revision as revision,
 c.search_terms as terms,s.id as subtheme_id,a.id as area_id,a.name as subarea,
 coalesce((select jsonb_agg(o.description order by o.position) from public.competency_objectives o where o.competency_id=c.id),'[]') as objectives,
 coalesce((select array_agg(cs.specialty_id) from public.competency_specialties cs where cs.competency_id=c.id),'{}'::uuid[]) as specialty_ids,
 (select count(distinct lc.id) from public.learning_contents lc join public.learning_content_versions lv on lv.content_id=lc.id where lc.competency_id=c.id and lv.editorial_status='published') as contents,
 (select count(distinct q.question_id) from public.question_version_competencies qc join public.question_versions q on q.id=qc.question_version_id where qc.competency_id=c.id and q.status in ('homologated','published')) as questions,
 (select count(distinct r.id) from public.learning_contents lc join public.learning_content_versions lv on lv.content_id=lc.id join public.learning_content_version_references lr on lr.version_id=lv.id join public.content_references r on r.id=lr.reference_id where lc.competency_id=c.id and lv.editorial_status='published' and r.verification_status='verified') as verified_references,
 (select count(*) from public.competency_references cr where cr.competency_id=c.id) as academic_references
from public.competencies c join public.subthemes s on s.id=c.subtheme_id
join public.themes t on t.id=s.theme_id join public.medical_areas a on a.id=t.area_id;
revoke all on public.curriculum_catalog_rows from public,anon,authenticated;

create function public.admin_curriculum_catalog(p_query jsonb default '{}')
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; page_no integer:=greatest(1,coalesce((p_query->>'page')::integer,1));
begin
 if not public.has_app_role('admin') then raise exception 'Forbidden' using errcode='42501'; end if;
 with base as (
  select r.*,case when contents>0 and questions>0 and verified_references>0 then 'covered'
   when contents+questions+verified_references>0 then 'partial' else 'uncovered' end as coverage
  from public.curriculum_catalog_rows r
 ), selected as (
  select * from base where
   (nullif(p_query->>'specialtyId','') is null or (p_query->>'specialtyId')::uuid=any(specialty_ids))
 ), filtered as (
  select * from selected where
   (nullif(p_query->>'id','') is null or id=(p_query->>'id')::uuid)
   and (nullif(p_query->>'areaId','') is null or area_id=(p_query->>'areaId')::uuid)
   and (coalesce(p_query->>'search','')='' or position(lower(p_query->>'search') in lower(concat_ws(' ',name,code,subarea,array_to_string(terms,' '))))>0)
   and (coalesce(p_query->>'coverage','')='' or coverage=p_query->>'coverage')
   and (coalesce(p_query->>'status','')='' or status=p_query->>'status')
   and (coalesce(p_query->>'missing','')<>'content' or contents=0)
   and (coalesce(p_query->>'missing','')<>'questions' or questions=0)
   and (coalesce(p_query->>'missing','')<>'references' or verified_references=0)
 ), paged as (select * from filtered order by subarea,name,id limit 25 offset (page_no-1)*25)
 select jsonb_build_object(
  'items',coalesce((select jsonb_agg(to_jsonb(p) order by subarea,name,id) from paged p),'[]'),
  'total',(select count(*) from filtered),'page',page_no,'pageSize',25,
  'summary',(select jsonb_build_object('total',count(*),'covered',count(*) filter(where coverage='covered'),'uncovered',count(*) filter(where coverage='uncovered'),'withQuestions',count(*) filter(where questions>0),'pendingReview',count(*)) from selected),
  'specialties',(select jsonb_agg(jsonb_build_object('id',sp.id,'name',sp.name,'count',(select count(*) from base b where sp.id=any(b.specialty_ids))) order by sp.name) from public.specialties sp where sp.is_active),
  'areas',coalesce((select jsonb_agg(to_jsonb(ar) order by name) from (select distinct area_id as id,subarea as name from selected) ar),'[]')
 ) into result;
 return result;
end $$;
revoke all on function public.admin_curriculum_catalog(jsonb) from public,anon;
grant execute on function public.admin_curriculum_catalog(jsonb) to authenticated;

create function public.admin_save_curriculum(p_id uuid,p_input jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare old_row public.competencies; old_objectives jsonb; next_status text:=p_input->>'status';
begin
 if not public.has_app_role('admin') then raise exception 'Forbidden' using errcode='42501'; end if;
 select * into old_row from public.competencies where id=p_id for update;
 if not found then raise exception 'Competency not found' using errcode='P0002'; end if;
 if old_row.is_active or old_row.curriculum_status='legacy_unreviewed' then
   raise exception 'Active competencies require a separate clinical revision' using errcode='22023'; end if;
 if (p_input->>'revision') is null or old_row.curriculum_revision<>(p_input->>'revision')::integer then
   raise exception 'Revision conflict' using errcode='40001'; end if;
 if next_status is null or next_status not in ('draft','pending_review')
  or length(trim(coalesce(p_input->>'name','')))<10 or length(p_input->>'name')>240
  or length(trim(coalesce(p_input->>'description','')))<20 or length(p_input->>'description')>4000
  or length(trim(coalesce(p_input->>'reason','')))<10 or length(p_input->>'reason')>1000
  or jsonb_typeof(p_input->'objectives') is distinct from 'array'
  or jsonb_array_length(p_input->'objectives') not between 1 and 12
  or jsonb_typeof(p_input->'terms') is distinct from 'array'
  or jsonb_array_length(p_input->'terms')>20 then raise exception 'Invalid curriculum input' using errcode='22023'; end if;
 if exists(select 1 from jsonb_array_elements(p_input->'objectives') o where jsonb_typeof(o)<>'string' or length(trim(o#>>'{}')) not between 10 and 600)
 or exists(select 1 from jsonb_array_elements(p_input->'terms') t where jsonb_typeof(t)<>'string' or length(trim(t#>>'{}')) not between 1 and 100) then raise exception 'Invalid curriculum input' using errcode='22023'; end if;
 if exists(select 1 from public.competencies c where c.id<>p_id and c.subtheme_id=old_row.subtheme_id and lower(trim(c.name))=lower(trim(p_input->>'name'))) then raise exception 'Duplicate competency' using errcode='23505'; end if;
 select coalesce(jsonb_agg(description order by position),'[]') into old_objectives from public.competency_objectives where competency_id=p_id;
 update public.competencies set name=trim(p_input->>'name'),description=trim(p_input->>'description'),
 curriculum_status=next_status,search_terms=array(select jsonb_array_elements_text(p_input->'terms')),
 curriculum_revision=curriculum_revision+1,updated_at=now() where id=p_id;
 delete from public.competency_objectives where competency_id=p_id;
 insert into public.competency_objectives(competency_id,position,description)
 select p_id,ordinality::smallint,trim(value) from jsonb_array_elements_text(p_input->'objectives') with ordinality;
 insert into public.editorial_audit_events(actor_id,actor_role,resource_type,resource_id,action,previous_state,next_state,metadata,request_id)
 values(auth.uid(),'admin','competency',p_id,'curriculum_draft_updated',old_row.curriculum_status,next_status,
 jsonb_build_object('reason',p_input->>'reason','before',to_jsonb(old_row)||jsonb_build_object('objectives',old_objectives),'after',p_input),coalesce(p_input->>'requestId','curriculum'));
 return p_id;
end $$;
revoke all on function public.admin_save_curriculum(uuid,jsonb) from public,anon;
grant execute on function public.admin_save_curriculum(uuid,jsonb) to authenticated;

-- Guard every entry point (including direct authenticated RPC) against draft targeting.
create function public.require_active_assessment_competency()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.competencies where id=new.competency_id and is_active) then
 raise exception 'Inactive competency cannot be assessed' using errcode='22023'; end if;
 return new;
end $$;
revoke all on function public.require_active_assessment_competency() from public,anon,authenticated;
create trigger assessment_competency_active before insert on public.assessment_competencies
for each row execute function public.require_active_assessment_competency();

-- Preserve compatibility during deployment: older APIs send all catalog IDs.
-- Eligibility is enforced in SQL as well as in the current API.
create or replace function public.start_diagnostic_assessment_v3(
  p_objective text,p_exam_program_id uuid,p_specialty_id uuid,
  p_duration_minutes smallint,p_question_count smallint,p_competency_ids uuid[],
  p_mode text
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_student uuid:=auth.uid(); v_id uuid; v_policy text; v_blueprint text;
begin
  if v_student is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_mode not in ('quick_screening','full_diagnostic') then raise exception 'invalid diagnostic mode' using errcode='22023'; end if;
  if coalesce(array_length(p_competency_ids,1),0)=0 then raise exception 'competencies required' using errcode='22023'; end if;
  if not exists(select 1 from public.competencies where id=any(p_competency_ids) and is_active) then
    raise exception 'Inactive competency cannot be assessed' using errcode='22023';
  end if;
  v_policy:=case when p_mode='full_diagnostic' then 'diagnostic-policy-v3-full-amrigs-synthetic' else 'diagnostic-policy-v3-quick-synthetic' end;
  select 'exam-blueprint-v'||eb.version into v_blueprint
  from public.exam_intelligence_profiles ep join public.exam_blueprints eb on eb.profile_id=ep.id
  where ep.exam_program_id=p_exam_program_id and ep.is_active and eb.is_active limit 1;
  insert into public.diagnostic_assessments(
    student_id,objective,exam_program_id,specialty_id,duration_minutes,question_count,
    mode,policy_version,blueprint_version,algorithm_version
  ) values(
    v_student,p_objective,p_exam_program_id,p_specialty_id,p_duration_minutes,p_question_count,
    p_mode,v_policy,v_blueprint,'assessment-v3'
  ) returning id into v_id;
  insert into public.assessment_competencies(assessment_id,competency_id)
  select v_id,c.id from public.competencies c where c.id=any(p_competency_ids) and c.is_active on conflict do nothing;
  return v_id;
end $$;

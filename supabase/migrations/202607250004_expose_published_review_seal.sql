drop policy if exists reviews_staff on public.content_reviews;

create policy reviews_staff
on public.content_reviews
for select
to authenticated
using (
  mentor_id = (select auth.uid())
  or public.can_manage_editorial()
  or (
    decision = 'approved'
    and exists (
      select 1
      from public.learning_content_versions version
      where version.id = version_id
        and version.editorial_status = 'published'
    )
  )
);

comment on policy reviews_staff on public.content_reviews is
'Students can read only approval evidence for published versions; internal review decisions remain staff-only.';

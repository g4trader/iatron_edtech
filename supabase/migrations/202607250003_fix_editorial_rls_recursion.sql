drop policy if exists learning_contents_staff on public.learning_contents;

create policy learning_contents_staff
on public.learning_contents
for select
to authenticated
using (
  public.can_manage_editorial()
  or assigned_mentor_id = (select auth.uid())
  or current_published_version_id is not null
);

comment on policy learning_contents_staff on public.learning_contents is
'Avoids recursive content/version RLS while exposing only identities with an explicitly published current version.';

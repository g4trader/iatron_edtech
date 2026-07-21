revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

comment on function public.handle_new_user() is 'SECURITY DEFINER trigger function required to create application-owned profile rows during auth.users signup. Not directly executable by API roles.';
comment on function public.set_updated_at() is 'Trigger-only timestamp maintenance function. Not directly executable by API roles.';

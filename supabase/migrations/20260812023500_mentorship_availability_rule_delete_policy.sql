create policy academy_mentorship_availability_rules_admin_delete
  on public.academy_mentorship_availability_rules
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users admin_user
      where admin_user.user_id = auth.uid()
    )
  );

grant delete on table public.academy_mentorship_availability_rules
  to authenticated;

-- Admin-only lookup for one student at a time, matched by exact email.
create or replace function public.admin_user_summary(p_email text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare v_summary jsonb;
begin
  if not public.is_app_admin() then raise exception 'Admin access required'; end if;
  if p_email is null or length(trim(p_email)) = 0 then raise exception 'Student email is required'; end if;

  select jsonb_build_object(
    'name', p.name,
    'email', coalesce(p.email, u.email),
    'roll_no', p.roll_no,
    'admission_no', p.admission_no,
    'year', p.year,
    'section', p.section,
    'phone', p.phone,
    'joined_at', p.created_at,
    'total_posts', (select count(*) from public.items i where i.reported_by = p.id),
    'returned_posts', (select count(*) from public.items i where i.reported_by = p.id and i.status = 'resolved'),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id,
        'title', i.title,
        'type', i.type,
        'category', i.category,
        'description', i.description,
        'location', i.location,
        'item_date', i.item_date,
        'status', i.status,
        'created_at', i.created_at,
        'reports', (select count(*) from public.reports r where r.item_id = i.id),
        'claims', (select count(*) from public.claims c where c.item_id = i.id)
      ) order by i.created_at desc)
      from public.items i where i.reported_by = p.id
    ), '[]'::jsonb)
  ) into v_summary
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(coalesce(p.email, u.email)) = lower(trim(p_email));

  return v_summary;
end;
$$;

revoke all on function public.admin_user_summary(text) from public, anon;
grant execute on function public.admin_user_summary(text) to authenticated;

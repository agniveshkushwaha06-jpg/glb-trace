-- Fix infinite RLS recursion on claims inserts.
-- The SECURITY DEFINER trigger guard_claim_submission already rejects a new
-- claim when an item has an approved claim, without invoking claims RLS.
drop policy if exists "users submit own claims" on public.claims;
create policy "users submit own claims" on public.claims for insert to authenticated
  with check (
    claimant_id = auth.uid()
    and exists (
      select 1
      from public.items i
      where i.id = item_id
        and i.reported_by <> auth.uid()
        and i.status = 'open'
        and i.type = 'found'
    )
  );

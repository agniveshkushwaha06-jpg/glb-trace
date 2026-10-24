-- One-time judging/demo fixture (run only in your demo Supabase project).
-- Sign in with two Google accounts first so both have profile rows.
-- The first profile becomes the reporter and the second becomes the claimant.
-- This adds 8 realistic reports, one already returned, one pending claim, and private answers.
-- Photos can be added to a few reports afterwards through the Report page.
do $$
declare
  v_reporter uuid;
  v_claimant uuid;
  v_wallet uuid;
  v_bottle uuid;
  v_keys uuid;
  v_umbrella uuid;
  v_notebook uuid;
begin
  select id into v_reporter from public.profiles order by created_at, id limit 1;
  select id into v_claimant from public.profiles where id <> v_reporter order by created_at, id limit 1;
  if v_reporter is null or v_claimant is null then
    raise exception 'Sign in with two different Google accounts and finish both profiles before running this demo setup.';
  end if;

  insert into public.items(type, title, category, description, location, item_date, status, reported_by, verification_question)
    values ('found', 'Black leather wallet', 'Wallet', 'Found by the library front desk. A card is tucked behind the coin pocket.', 'Library', current_date - 1, 'open', v_reporter, 'What colour card is behind the coin pocket?') returning id into v_wallet;
  insert into public.item_secrets(item_id, answer) values (v_wallet, 'Blue');
  insert into public.claims(item_id, claimant_id, answer, status) values (v_wallet, v_claimant, 'Blue', 'pending');

  insert into public.items(type, title, category, description, location, item_date, status, reported_by, verification_question)
    values ('found', 'Steel water bottle', 'Bottle', 'Silver bottle with a small mountain sticker.', 'Ground', current_date - 3, 'resolved', v_reporter, 'What shape is the sticker?') returning id into v_bottle;
  insert into public.item_secrets(item_id, answer) values (v_bottle, 'Mountain');
  insert into public.claims(item_id, claimant_id, answer, status, decided_at) values (v_bottle, v_claimant, 'Mountain', 'approved', now() - interval '1 day');

  insert into public.items(type, title, category, description, location, item_date, status, reported_by, verification_question)
    values ('found', 'Set of bike keys', 'Keys', 'Two keys on a red fabric keychain.', 'Parking', current_date - 2, 'open', v_reporter, 'What colour is the keychain?') returning id into v_keys;
  insert into public.item_secrets(item_id, answer) values (v_keys, 'Red');
  insert into public.items(type, title, category, description, location, item_date, status, reported_by, verification_question)
    values ('found', 'Blue foldable umbrella', 'Other', 'Left beside the computers in the lab.', 'Lab Block', current_date - 5, 'open', v_reporter, 'What colour is the umbrella?') returning id into v_umbrella;
  insert into public.item_secrets(item_id, answer) values (v_umbrella, 'Blue');
  insert into public.items(type, title, category, description, location, item_date, status, reported_by, verification_question)
    values ('found', 'Spiral notebook', 'Books', 'Physics notes with a torn name label on the first page.', 'Classroom Block', current_date - 6, 'open', v_reporter, 'Which subject is written inside?') returning id into v_notebook;
  insert into public.item_secrets(item_id, answer) values (v_notebook, 'Physics');

  insert into public.items(type, title, category, description, location, item_date, status, reported_by) values
    ('lost', 'GLB student ID card', 'ID Card', 'Blue lanyard. The name sticker is peeling at one corner.', 'Canteen', current_date - 2, 'open', v_reporter),
    ('lost', 'Wireless earbuds in white case', 'Earphones', 'A small crack on the right side of the charging case.', 'Classroom Block', current_date - 4, 'open', v_reporter),
    ('lost', 'Scientific calculator', 'Electronics', 'Left after the maths tutorial. Name is written under the cover.', 'Library', current_date - 7, 'open', v_reporter);
end $$;

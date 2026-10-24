# GLB Trace — Campus Lost & Found Portal

> Hustle Carnival · Problem Statement **ELU02** · Organised by Ellusion, GL Bajaj Group of Institutions, Mathura
> Build time: **6 hours** · Goal: working, deployed prototype

This README is the single source of truth for the project.

---

## 1. Problem Statement (ELU02)

Students lose ID cards, books, wallets, earphones, etc. on campus. This platform lets students:

1. Report **lost** or **found** items
2. Add **details, description, and images**
3. **Search** listings
4. **Contact** the person who reported an item

---

## 2. Local setup

```bash
cd glb-trace
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=glbajajgroup.org
NEXT_PUBLIC_ENFORCE_EMAIL_DOMAIN=false
```

Set `NEXT_PUBLIC_ENFORCE_EMAIL_DOMAIN=true` to require `@glbajajgroup.org` emails. Leave it `false` for demo testing with any Google account.

### Supabase

1. Copy your project's URL and publishable key from Supabase → Project Settings → API Keys into `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). A legacy anon key also works if your project only shows that option.
2. Run the full `supabase/schema.sql` in the SQL Editor (it upgrades the earlier starter tables too).
3. Create a **public** storage bucket named `item-images`, with a **3 MB** file size limit and allowed MIME types `image/jpeg,image/png,image/webp`.
4. Enable **Google** in Auth providers.
5. Add redirect URLs: `http://localhost:3000/auth/callback` and `https://<your-vercel-domain>/auth/callback`.
6. To enable the admin panel, in SQL Editor set your own email in the private settings list:

```sql
update public.app_settings set value = '["your-email@gmail.com"]'::jsonb where key = 'admin_emails';
```

Until that is set, the app remains a normal campus member experience and `/admin` stays closed.

### Optional demo feed

After the database is set up, sign in with both demo Google accounts and save both profiles. Then run `supabase/seed.sql` once in the Supabase SQL Editor. It adds 8 example reports, including one returned item and one pending claim. Add a few item photos from the Report page before showing the demo.

### Google sign-in (one manual setup)

1. In Google Cloud Console, create an OAuth client for a web app.
2. Set the authorized JavaScript origins to `http://localhost:3000` and your Vercel address.
3. Set the authorized redirect URI to `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`.
4. Copy the Google client ID and secret into Supabase → Authentication → Sign-in providers → Google.
5. In Supabase → Authentication → URL Configuration, set the Site URL to your Vercel address and allow `http://localhost:3000/**` plus `https://<your-vercel-domain>/**`.
6. While Google's consent screen is in testing, add both demo Google accounts as test users.

Demo listings (optional): after you have a profile row, edit `supabase/seed.sql` with your profile uuid and run it.

---

## 3. Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase Postgres |
| File storage | Supabase Storage (`item-images`) |
| Hosting | Vercel |
| Icons | lucide-react |

---

## 4. Pages

- `/` — landing, search, latest items
- `/login` — Continue with Google
- `/profile` — name, roll no, admission no, year, section, phone
- `/report` — lost/found form with image upload
- `/items` — listings, search, filters (`?q=&type=&category=&location=`)
- `/items/[id]` — detail, private owner question, claim approval, contact reveal, return tracking
- `/my-items` — your reports
- `/activity` — your reports, sent claims, and incoming claims
- `/admin` — admin-only counts and post removal

The email/phone and the reporter's correct verification answer are protected by database access rules. Only the item reporter can read the saved answer. Contact details are returned by a database function only after a claim is approved, and only to the two people in that handover.

Protected routes: `/report`, `/my-items`, `/profile`, `/activity`, and `/admin` (admin email required for the last one).

---

## 5. Deploy on Vercel

1. Push this folder to GitHub (or Cursor Origin).
2. Import the repo in Vercel. Root directory: `glb-trace` if the repo parent is the workspace folder.
3. Add the same environment variables.
4. Redeploy after adding the production `/auth/callback` URL in Supabase.

---

## 6. Demo script (3 min)

1. **Problem (20s):** Students lose ID cards, wallets, earphones daily; no proper way to find them.
2. **Login (10s):** Sign in with Google.
3. **Report (40s):** Report a lost item with photo, description, location.
4. **Search (40s):** Search and filter to find a found item.
5. **Claim (30s):** Claim the found item with its private verification answer.
6. **Approve (30s):** Reporter compares the claimant's answer with the saved answer.
7. **Handover (20s):** Contact is revealed after approval; mark the item returned.
8. **Close (20s):** "Find it. Claim it. Return it."

---

**Team:** _(fill Team ID / Team Name)_ · **Built for:** Hustle Carnival, Ellusion — GL Bajaj Mathura

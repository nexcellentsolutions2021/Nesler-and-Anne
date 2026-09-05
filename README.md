# Nesler & Anne — RSVP System (GitHub + Vercel + Supabase)

Same look and features as the Google Apps Script version, but the guest list now
lives in a real Postgres database (Supabase, free tier) and the backend runs as
serverless functions on Vercel (also free tier) instead of Apps Script. No
Google Sheets involved.

- Guest RSVP page → `index.html`
- Admin dashboard → `admin.html` (password-gated with an admin key you choose)
- Backend → `/api/*.js` (Vercel serverless functions)
- Database → Supabase Postgres (`guests` + `settings` tables)

## 1. Create the database (Supabase, free)

1. Go to https://supabase.com → New project (free tier is enough for a guest list).
2. Once it's created, open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and click **Run**. This creates the `guests` and
   `settings` tables.
3. Go to **Project Settings → API** and copy two values:
   - **Project URL** → this is `SUPABASE_URL`
   - **service_role key** (not the `anon` key) → this is `SUPABASE_SERVICE_KEY`

   Keep the service_role key secret — it goes into Vercel's environment
   variables only, never into any file that's committed to GitHub.

## 2. Push the code to GitHub

1. Create a new empty repository on GitHub.
2. From this folder:
   ```
   git init
   git add .
   git commit -m "Nesler & Anne RSVP system"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

## 3. Deploy on Vercel (free)

1. Go to https://vercel.com → **Add New → Project** → import the GitHub repo.
2. It should auto-detect this as a plain (non-framework) project — no build
   command needed.
3. Before deploying, add three **Environment Variables** (Project Settings →
   Environment Variables, or during the import screen):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `ADMIN_KEY` — any password you choose; this is what protects the admin
     dashboard now that it's not implicitly behind a Google login.
4. Deploy.

Your links:
- Guest page: `https://your-project.vercel.app/`
- Admin dashboard: `https://your-project.vercel.app/admin.html` — enter the
  `ADMIN_KEY` you set when prompted. It's remembered in that browser after
  the first login.

## 4. Add your guest list

Open the admin dashboard → **Guest List → Import**, download the template,
fill it in (or use **+ Add Guest** one at a time), and import.

## What changed from the Google Sheets version

- The 22-column "Guests" sheet became two Postgres tables: `guests` (one row
  per invited party, companions stored together as a small JSON list) and
  `settings` (the RSVP open/closed toggle).
- `google.script.run` calls became `fetch()` calls to `/api/...` endpoints.
- The admin page's protection used to come implicitly from the Apps Script
  deployment; now it's a simple key you set as `ADMIN_KEY` and enter once in
  the browser.
- Wedding details updated: **Nesler & Anne**, **December 20, 2026**, RSVP
  deadline **November 20, 2026**, Viridis Countryside Garden, Amadeo, Cavite.
  Theme stays burgundy & gold.

## Local testing (optional)

```
npm install -g vercel
npm install
vercel dev
```
`vercel dev` will ask you to link the project and will read `.env` for the
three variables above (copy `.env.example` to `.env` first).

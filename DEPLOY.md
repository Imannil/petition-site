# Deploying the Petition Site — Step-by-Step Guide

This guide walks you through going live with the petition website (e.g. on **Vercel** with **PostgreSQL**). Follow the steps in order.

---

## Prerequisites

- **Node.js 18+** installed locally
- **Git** installed
- **Accounts** (free tiers are enough):
  - [GitHub](https://github.com) (or GitLab / Bitbucket)
  - [Vercel](https://vercel.com)
  - A **PostgreSQL** provider: [Vercel Postgres](https://vercel.com/storage/postgres), [Neon](https://neon.tech), or [Supabase](https://supabase.com)

---

## Step 1: Put Your Code in Git and Push to GitHub

1. Open a terminal in the project folder:
   ```bash
   cd /Users/imannil/Downloads/petition-site
   ```

2. If the folder is not yet a Git repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: petition site ready for deploy"
   ```

3. Create a **new repository** on GitHub (e.g. `stopiranwar` or `petition-site`). Do **not** add a README or .gitignore there.

4. Add the remote and push (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

5. **Important:** Ensure `.env`, `.env.local`, and any file with secrets are in `.gitignore`. Never commit `DATABASE_URL` or API keys.

---

## Step 2: Create a Production PostgreSQL Database

You need a **PostgreSQL connection string** for production. Choose one option below.

### Option A: Vercel Postgres (simplest if you use Vercel)

1. Go to [vercel.com](https://vercel.com) → sign in.
2. Open your **Team** or **Personal** account.
3. Go to **Storage** → **Create Database** → choose **Postgres**.
4. Name it (e.g. `stopiranwar-db`), pick a region near your users, click **Create**.
5. After creation, open the database → **`.env.local`** tab.
6. Copy the **`POSTGRES_URL`** (or `DATABASE_URL`) value. It looks like:
   ```text
   postgresql://user:pass@host.region.vercel-storage.com:5432/verceldb?sslmode=require
   ```
7. You will paste this into Vercel’s environment variables in Step 4. You can also use it locally as `DATABASE_URL` when running migrations and seed.

### Option B: Neon

1. Go to [neon.tech](https://neon.tech) → sign in (e.g. with GitHub).
2. **New Project** → name it, choose region, create.
3. In the dashboard, open **Connection details**.
4. Copy the **connection string** (use the one with **pooled** if offered). It looks like:
   ```text
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Use this as `DATABASE_URL` in Vercel (Step 4) and locally for migrations/seed.

### Option C: Supabase

1. Go to [supabase.com](https://supabase.com) → sign in → **New project**.
2. Name the project, set a database password, choose region, create.
3. In the project: **Settings** → **Database**.
4. Under **Connection string**, choose **URI** and copy it. Use the **Session mode** or **Transaction** URI (not Direct). It looks like:
   ```text
   postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres
   ```
5. Use this as `DATABASE_URL` in Vercel and locally.

---

## Step 3: Deploy the Site on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. **Import** your GitHub repository (e.g. `YOUR_USERNAME/YOUR_REPO`).
3. **Configure Project:**
   - **Framework Preset:** Next.js (should be auto-detected).
   - **Root Directory:** leave blank (repo root).
   - **Build Command:** `npm run build` (default; your `package.json` already has this).
   - **Output Directory:** leave default.
   - **Install Command:** `npm install` (default).
4. Do **not** click **Deploy** yet. First add the database URL (Step 4).

---

## Step 4: Set Environment Variables in Vercel

1. In the same Vercel project setup page, open **Environment Variables**.
2. Add:
   - **Name:** `DATABASE_URL`  
     **Value:** your production PostgreSQL connection string from Step 2.  
     **Environments:** check **Production**, **Preview**, and **Development** if you use Vercel previews.
3. (Optional) For future bot protection you can add Cloudflare Turnstile later: set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel. Not required for initial deploy.
   - **Name:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` → **Value:** your Turnstile **site key** (public).  
   - **Name:** `TURNSTILE_SECRET_KEY` → **Value:** your Turnstile **secret key** (private).  
   - **Environments:** check **Production** (and **Preview** if you use preview deployments).
   - Get keys: [Cloudflare Dashboard](https://dash.cloudflare.com) → **Turnstile** → Add widget → copy Site key and Secret key. Use the same domain (or leave “all domains” for testing).
   - If **both** keys are set: the form shows the Turnstile widget and submissions are verified; if the widget is not completed or verification fails, the user sees “Verification failed. Please try again.”
   - If you **do not** set these keys: the form works without Turnstile (no widget, no server-side verification).
4. Click **Deploy**. Wait for the build to finish. The first deploy may succeed even before the database is set up; the app will need the DB for the form and signatures list to work.

---

## Step 5: Run Migrations and Seed on the Production Database

The app needs the correct schema and initial supporters in the **production** database. Do this from your **local machine** using the **production** `DATABASE_URL`.

1. In your project folder, ensure you have the production URL available. Either:
   - Temporarily set it in `.env` or `.env.local`, or  
   - Export it in the terminal for the next commands (do not commit it):
     ```bash
     export DATABASE_URL="postgresql://..."   # paste your production URL
     ```

2. Apply the schema (migrations):
   ```bash
   npx prisma migrate deploy
   ```
   If you have never run migrations and the DB is empty, use:
   ```bash
   npx prisma db push
   ```
   (Use `migrate deploy` if you already have a migration history; otherwise `db push` is fine for a fresh DB.)

3. Seed the initial supporters so they appear at the top of the signatures list:
   ```bash
   npm run db:seed
   ```
   or:
   ```bash
   npx prisma db seed
   ```

4. After this, open your live Vercel URL. You should see:
   - Signature count (including the seeded initial supporters)
   - The signatures list with initial signatories at the top

---

## Step 6: (Optional) Custom Domain (e.g. stopiranwar.org)

1. In Vercel: open your **Project** → **Settings** → **Domains**.
2. Add your domain (e.g. `stopiranwar.org` or `www.stopiranwar.org`).
3. Follow Vercel’s instructions to add the DNS records at your registrar (A/CNAME or the nameservers they give). Usually:
   - **A** record: `76.76.21.21` (Vercel’s IP), or  
   - **CNAME** for `www`: `cname.vercel-dns.com`
4. Wait for DNS to propagate (minutes to hours). Vercel will issue HTTPS automatically.

---

## Step 7: Post-Launch Checklist

- [ ] Visit the live URL and submit a test signature; confirm it appears in the list.
- [ ] Switch language (EN / Farsi) and check statement, form, and list.
- [ ] Confirm initial supporters appear at the top of the signatures list.
- [ ] If you use Turnstile, confirm the widget appears on the form and that a submission after completing it succeeds; try submitting without completing it and confirm you see “Verification failed. Please try again.”
- [ ] (Optional) Add Turnstile keys and any CSP updates if you enable it later.
- [ ] Keep `DATABASE_URL` and other secrets only in Vercel (and local `.env`); never commit them.

---

## Quick Reference: Commands

| Task | Command |
|------|--------|
| Build locally | `npm run build` |
| Run production locally | `npm run start` |
| Apply migrations (production) | `npx prisma migrate deploy` |
| Push schema without migrations | `npx prisma db push` |
| Seed initial supporters | `npm run db:seed` or `npx prisma db seed` |
| Open DB in browser | `npx prisma studio` (use production `DATABASE_URL` to edit live DB) |

---

## Troubleshooting

- **Build fails on Vercel:** Check the build logs. Ensure `DATABASE_URL` is set for the build if any step needs it (your app builds without DB; Prisma generate runs in `postinstall` and `build`).
- **“No signatures” / empty list:** Run the seed (Step 5) with the **production** `DATABASE_URL`. Confirm in Prisma Studio that `supporters` has rows and `is_initial_supporter` is set for the initial 12.
- **Form submission fails:** Verify `DATABASE_URL` in Vercel is correct and the database accepts connections (e.g. from Vercel’s IP if required by your DB host).
- **Rate limit / bot protection:** The app uses in-memory rate limiting (5 per IP per hour). For multiple serverless instances, consider adding Redis later; for a single deploy it’s usually fine.

Once Steps 1–5 are done, your site is live with a working database and initial supporters. Add a custom domain (Step 6) when you’re ready.

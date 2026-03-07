# Stop Iran War — Petition Site

Production-ready single-page petition website for **stopiranwar.org**. Built with Next.js (App Router), TypeScript, Tailwind CSS, and PostgreSQL (Prisma).

## Features

- **Single-page experience**: Hero, petition statement, initial signatories marquee, sign form, public supporters list, footer
- **Scalable data model**: PostgreSQL with Prisma; indexes for count and list queries
- **Security**: Server-side validation (Zod), sanitization, duplicate prevention by email, rate limiting (5 submissions per IP per hour), optional Turnstile
- **Privacy**: Email never displayed; only first name, country, and optional affiliation shown publicly
- **Moderation-ready**: `isApproved` and abuse-prevention fields (ipHash, userAgentHash) in schema

## Prerequisites

- Node.js 18+
- PostgreSQL (e.g. Vercel Postgres, Neon, Supabase, or local)

## Setup

1. **Clone and install**
   ```bash
   cd petition-site
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Optional: add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` for Cloudflare Turnstile

3. **Database**
   ```bash
   npx prisma db push
   npm run db:seed
   ```
   Or use migrations: `npx prisma migrate dev` then `npm run db:seed`.

   The app uses `force-dynamic` for the home page, so you can run `npm run build` without a database; at runtime you need a valid `DATABASE_URL`.

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Content to Replace

- **Petition statement**: Edit `content/petition-statement.ts` (intro + body paragraphs).
- **Initial 80 signatories**: Edit `content/initial-signatories.ts`. Then re-run seed or insert via Prisma. The UI shows DB-backed initial supporters when present; otherwise it falls back to this file.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No | Cloudflare Turnstile site key (form bot protection) |
| `TURNSTILE_SECRET_KEY` | No | Turnstile secret key (server-side verify) |

## Scripts

- `npm run dev` — development server
- `npm run build` — Prisma generate + Next.js build
- `npm run start` — production server
- `npm run db:push` — push schema to DB (no migrations)
- `npm run db:migrate` — deploy migrations
- `npm run db:seed` — seed initial 80 supporters

## Architecture

- **App Router**: Single page at `/`; server components for statement and initial supporters; client components for hero (count), form, and supporters list.
- **Actions**: `signPetition` (form submit), `getSupportersCount` (via `/api/count`), `getPublicSupporters` (via `/api/supporters`), `getInitialSupporters`.
- **Validation**: Zod in `lib/validation.ts`; country allowlist in `data/countries.ts`.
- **Rate limiting**: In-memory in `lib/rateLimit.ts` (per-IP, 5/hour for sign). For multi-instance production, consider Redis-backed rate limiting.

## Security Recommendations Before Production

1. **Bot protection**: Enable Cloudflare Turnstile (add keys, uncomment and implement verification in `app/actions/sign.ts`). If you use Turnstile, add `https://challenges.cloudflare.com` to `connect-src` in `middleware.ts` CSP.
2. **Rate limiting**: Replace in-memory store with Redis (or similar) if you run multiple instances.
3. **HTTPS**: Use TLS in production (Vercel/other hosts provide this).
4. **Headers**: Security headers are set in `next.config.js` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection).
5. **Database**: Use a managed Postgres with connection pooling (e.g. Vercel Postgres, Neon) and restrict network access.
6. **Secrets**: Never commit `.env.local`; use platform env vars or a secret manager.

## Deploy (e.g. Vercel)

1. Connect repo to Vercel; set `DATABASE_URL` (and optional Turnstile keys).
2. Use Vercel Postgres or attach an external Postgres; run migrations/seed from your machine or a one-off job.
3. Build command: `npm run build` (runs `prisma generate` via postinstall and build script).

## Dependencies

- **Next.js**: Pinned to **14.2.35** (latest patched 14.x). `npm audit` may report one high-severity finding; there is no 14.x patch for it—fixes exist only in Next 15+. Staying on 14.2.35 is an intentional choice; upgrade to 15+ when ready to accept possible breaking changes.
- **Prisma**: 5.x is supported; the “update available” notice to 7.x can be ignored until you are ready for a major upgrade.

## License

Private / use as needed for the petition project.

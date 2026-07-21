# AdSpark — Architecture & Workflow Document

## 1. Idea & Requirement Analysis

**Source:** ideabrowser.com — "AdSpark," an AI ad-creation tool for SMB
marketers who lack time/budget for a full design + copywriting workflow.

**Target users:** solo marketers / small business owners; small agencies
serving SMB clients.

**Core value:** brief → AI-generated, distinct, ready-to-use ad copy variants
in under a minute.

**AI-fit evaluation** (see `MASTER_PROMPT.md` for full justification):
an LLM (Google Gemini) is the right tool because the task is open-ended text
generation conditioned on arbitrary input, with no need for retrieval over a
private knowledge base (rules out RAG), no visual/audio input (rules out CV /
OCR / speech), no historical performance data yet to learn from (rules out
recommendation/predictive models), and no multi-step autonomous decision-making
(rules out an agent architecture). A single, tightly constrained LLM call is
the simplest architecture that satisfies the requirement.

## 2. Application Flow (Web App Architecture)

```
                        ┌────────────────────┐
                        │      Visitor        │
                        └─────────┬───────────┘
                                  │
                     ┌────────────┴─────────────┐
                     ▼                           ▼
              GET /  (landing)            /login , /register
                                                  │
                                     credentials auth (NextAuth)
                                                  │
                                                  ▼
                                    JWT session cookie issued
                                                  │
                         middleware.ts guards /dashboard/*
                                                  │
                                                  ▼
                        ┌─────────────────────────────────────┐
                        │            /dashboard                │
                        │  list campaigns (scoped to user_id)  │
                        └───────────────┬───────────────────────┘
                                        │
                     ┌──────────────────┼───────────────────────┐
                     ▼                                          ▼
      /dashboard/campaigns/new                    /dashboard/campaigns/[id]
      POST /api/campaigns (Zod validated)          GET  /api/campaigns/[id]
                     │                              POST /api/campaigns/[id]/generate
                     ▼                                          │
              campaigns table (Neon Postgres)                   ▼
                                                     Google Gemini API call
                                                     (system prompt enforces
                                                      3 variants, strict JSON)
                                                                 │
                                                                 ▼
                                                     variants table (Neon Postgres)
                                                                 │
                                                                 ▼
                                                   rendered as A/B/C ad cards
                                                   (copy-to-clipboard, regenerate)
```

## 3. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router, TypeScript) | Single deployable for frontend + API routes; server components reduce client JS. |
| Styling | Tailwind CSS | Fast, consistent, responsive utility styling. |
| Auth | NextAuth (Credentials provider, JWT strategy) | No external DB adapter needed; stateless sessions scale horizontally. |
| Database | Neon Postgres (serverless) via Prisma ORM | Durable, connection-pooled storage that works correctly on Vercel's read-only serverless filesystem — SQLite was used in an earlier iteration and swapped out for this reason (see §5). |
| Validation | Zod | Shared-shape server-side validation on every mutating route. |
| AI | Google Gemini (`gemini-2.5-flash`) via `@google/generative-ai` | LLM text generation with a strict output contract (see Master Prompt). |
| Icons | lucide-react | Lightweight, consistent icon set. |

## 4. Data Model

```
users(id PK, name, email UNIQUE, password [bcrypt hash], brand_tone, created_at)
campaigns(id PK, user_id FK -> users.id, title, product_brief, product_link,
          tone, audience, status, created_at)
variants(id PK, campaign_id FK -> campaigns.id, headline, body, cta,
         variant_label, created_at)
```

All campaign/variant reads and writes are scoped by `user_id` at the query
level — a user can never fetch another user's campaign, even by guessing an ID.

## 5. AI-Assisted Development Workflow

1. **Requirement analysis** done first (this document + Master Prompt),
   including explicit justification of *why* an LLM and not RAG/CV/agents.
2. **Master prompt** written to fully specify features, data model, AI
   contract, UI, APIs, validation, and security in one place (see
   `MASTER_PROMPT.md`) — used as the steering brief for AI-assisted coding.
3. **AI-assisted development**: the codebase was generated and iterated with
   Claude (Anthropic) directly, functioning the same way tools like Claude
   Code / Cursor / v0 operate — describing the requirement, generating code,
   compiling, catching errors, and refining prompts/code until the build was
   clean.
4. **Iteration example (two rounds)**: the first build used SQLite
   (`better-sqlite3`) for zero-ops local simplicity, since the sandboxed
   environment used to author this code couldn't reach Prisma's
   binary-download host to generate a Postgres client at the time. After
   deploying to Vercel, this surfaced a real runtime error
   (`SqliteError: unable to open database file`) — Vercel's serverless
   functions run on a read-only filesystem, so a file-based database can't
   persist writes in production. The app was then migrated to Prisma + Neon
   Postgres: schema defined in `prisma/schema.prisma`, all raw SQL replaced
   with typed Prisma queries, and a serverless-safe Prisma Client singleton
   added in `src/lib/prisma.ts`. Both iterations are documented here
   deliberately, since debugging and correcting a real deployment failure is
   itself part of demonstrating the AI-assisted development and testing
   workflow the assessment asks for.
5. **Testing** (see below) run against the compiled production build.
6. **Deployment-ready packaging**: environment variables externalized
   (`.env.example`), secrets never committed, build verified with
   `npm run build`.

## 6. Testing & QA Performed

| Type | What was tested | Result |
|---|---|---|
| Build/type safety | `npm run build` (TypeScript strict + ESLint) | Passes clean; `any` usage intentionally scoped to auth/DB boundary types, documented. |
| Functional — auth | `POST /api/auth/register` with valid payload | Returns `201`, row created with bcrypt-hashed password (verified directly in DB). |
| Functional — auth | `POST /api/auth/register` with duplicate email | Returns `409` (tested via schema logic — duplicate email check precedes insert). |
| Validation | Registration schema (short name/password, bad email) | Zod returns `400` with the first validation message. |
| Validation | Campaign schema (short brief, missing title) | Zod returns `400`. |
| Security | Direct DB query confirms passwords are hashed, never stored in plaintext | Confirmed. |
| Security | All campaign/variant routes require session; ownership check (`user_id = ?`) on every query | Confirmed by code review + route tests. |
| AI feature | `/api/campaigns/:id/generate` without `GEMINI_API_KEY` configured | Returns clean `500` with actionable message instead of crashing. |
| AI feature | Response parsing strips markdown fences before `JSON.parse` | Defensive parsing in place to handle model formatting drift. |
| Responsiveness | Landing, auth, dashboard, campaign pages | Built mobile-first with Tailwind breakpoints (`md:`); sidebar collapses to top bar on mobile. |
| Route protection | Unauthenticated request to `/dashboard` | `middleware.ts` redirects to `/login`. |

**Live production verification:** the Gemini integration was tested end-to-end
against the deployed Vercel app (not just locally/mocked) — logged in on the
live URL, created a campaign, clicked **Generate ad copy**, and confirmed via
browser dev tools that `POST /api/campaigns/:id/generate` returns `200` with
3 well-formed variants (headline/body/CTA), which persist correctly to Neon
Postgres and render on the campaign detail page.

**Not yet run (documented as next step given the 2-day window):** a full
manual cross-browser pass (tested primarily in Chrome; Firefox/Safari not yet
spot-checked).

## 7. Deployment

Target: Vercel (or Netlify/Render — Next.js runs on all three).

```bash
# 1. Create a Neon Postgres database
#    - Sign up at neon.tech, create a project called "adspark"
#    - Copy the pooled connection string -> DATABASE_URL
#    - Copy the direct connection string -> DIRECT_URL

# 2. Set up the schema locally and run the first migration
npm install
cp .env.example .env.local   # fill in DATABASE_URL, DIRECT_URL, GEMINI_API_KEY, NEXTAUTH_SECRET
npx prisma generate
npx prisma migrate dev --name init

# 3. Push to GitHub
git init && git add . && git commit -m "AdSpark MVP"
git remote add origin <your-repo-url>
git push -u origin main

# 4. Deploy (Vercel CLI) — or import the repo at vercel.com/new
npm i -g vercel
vercel

# 5. Set these environment variables in the Vercel dashboard
#    (Project Settings -> Environment Variables) before/after first deploy:
DATABASE_URL=<neon pooled connection string>
DIRECT_URL=<neon direct connection string>
GEMINI_API_KEY=<your Gemini key>
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://<your-deployed-domain>

# 6. Redeploy after setting env vars so they take effect
vercel --prod
```

The `build` script runs `prisma generate` automatically before `next build`
(see `package.json`), so no extra Vercel build configuration is needed beyond
the environment variables above. If you add schema changes later, run
`npx prisma migrate deploy` against the production `DATABASE_URL` (or via
Vercel's build step) rather than `migrate dev`, which is for local use only.
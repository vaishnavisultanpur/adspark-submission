# Master Prompt — AdSpark

**Idea source:** ideabrowser.com — "AdSpark: Quick, custom ads in one click."
(This is a startup idea, taken directly from the reference source listed in the
assessment brief: www.ideabrowser.com.)

**Note on scope/interpretation:** the brief references ideabrowser.com and
10000ideas.com as sources to pick *an idea* from ("convert that idea into a
complete, production-ready application"), and separately references
10000ideas.com for UI/UX design inspiration in point 3. Per that reading, this
submission sources one specific startup idea (AdSpark) from ideabrowser.com and
builds the full production application for that idea — rather than building a
meta-directory/clone of the idea-browsing sites themselves. This interpretation
is also what makes point 1's requirement (identify target users, core features,
business logic, and justify AI-fit) meaningful, since those apply to a specific
product, not to a listing site.

**Why this idea, per ideabrowser's own market analysis:** the platform frames
this as well-timed given the scale and continued growth of digital ad spend,
and identifies the market gap as SMBs in non-English-speaking regions being
underserved by ad-creation tools that mostly target large enterprises and
English-language markets. That gap — affordable, fast ad copy for
resource-constrained small businesses — is what AdSpark's MVP scope (a single
brief-to-copy flow, no enterprise complexity) is built to address.

This is the master prompt used to drive AI-assisted development of the application
(with Claude). It captures the full requirement analysis in a single, structured
brief, and was iteratively refined while building.

---

## Prompt

You are building **AdSpark**, a web application for small and medium marketing
teams who don't have time or budget for a design/copywriting workflow. The core
problem: marketers at small shops spend hours hunting stock imagery, resizing
assets, and rewriting headlines just to launch one ad campaign. AdSpark removes
that grind by turning a short product brief into ready-to-use ad copy in under a
minute.

### Target users
- Solo marketers and small-business owners running their own ad campaigns.
- Small marketing agencies serving SMB clients who need fast turnaround.

### Core user flow
1. User signs up and sets a **default brand tone** (Friendly / Professional /
   Bold / Playful / Luxury).
2. User creates a **campaign**: title, product brief, optional product link,
   tone override, optional target audience.
3. User clicks **Generate ad copy** — the AI produces exactly 3 distinct ad
   variants (benefit-led, urgency-led, social-proof-led), each with a headline,
   body copy, and a call-to-action.
4. User reviews variants, copies the one they want, and can regenerate at any
   time.
5. Campaigns are saved and listed on a dashboard with status (`draft` /
   `generated`).

### Where AI adds value (and why this shape of AI)
- **LLM (Google Gemini), not a generic template engine** — ad copy needs to adapt to
  arbitrary products, tones, and audiences; a fixed template can't cover that
  range. A prompt-engineered system prompt with strict output constraints
  (word limits, exactly 3 variants, distinct angles, valid JSON only) gives
  controllable, structured output without needing RAG, fine-tuning, or a
  vector DB — the brief itself is the only "knowledge" the model needs per
  request, so retrieval-augmented generation would add complexity with no
  benefit here.
- **Explicitly not used:** Computer Vision / OCR / Speech-to-Text — no image or
  audio input exists in this flow. Recommendation engines / predictive
  analytics — out of scope for an MVP with no historical performance data to
  learn from yet (a natural v2 extension once campaigns accumulate CTR data).
  AI agents — the task is single-shot generation, not a multi-step autonomous
  workflow, so a plain LLM call is the right level of complexity rather than
  an agent loop.

### Features
- Email/password authentication (register, login, logout), session-based route
  protection for `/dashboard/*`.
- Campaign CRUD (create, list, view detail).
- AI-generated ad variants (3 per generation, regenerate on demand).
- Copy-to-clipboard per variant.
- Responsive dashboard: sidebar nav (desktop) / top bar (mobile), campaign
  grid, campaign detail with generate button.

### User roles
- Single role for MVP: authenticated user, scoped to their own campaigns only
  (all queries filtered by `user_id`). No admin role in v1 — flagged as a
  future extension (e.g. agency admins managing multiple client accounts).

### Database structure
- `users(id, name, email UNIQUE, password_hash, brand_tone, created_at)`
- `campaigns(id, user_id FK, title, product_brief, product_link, tone,
  audience, status, created_at)`
- `variants(id, campaign_id FK, headline, body, cta, variant_label,
  created_at)`

### AI capability spec
- Provider: Google Gemini (`gemini-2.5-flash`) via `@google/generative-ai`.
- System prompt fixes output contract: exactly 3 variants labeled A/B/C, each
  with headline ≤ 8 words, body ≤ 30 words, CTA ≤ 5 words, angle-diverse,
  strict JSON only (no markdown fences).
- Server strips code fences defensively and parses JSON before persisting.

### UI requirements
- Dark theme, amber accent (`#fbbf24`-family) evoking "spark."
- Typography: system/Geist sans, tight tracking on headlines.
- Fully responsive: single-column mobile, sidebar + grid on desktop.
- Empty states, loading states, and inline error states on every async action.

### APIs
- `POST /api/auth/register` — create account (Zod-validated).
- `POST /api/auth/[...nextauth]` — credentials login (NextAuth).
- `GET/POST /api/campaigns` — list / create campaigns (auth-guarded).
- `GET /api/campaigns/:id` — campaign + variants (auth + ownership guarded).
- `POST /api/campaigns/:id/generate` — calls Gemini, persists via Prisma, and returns
  variants.

### Validations
- Zod schemas on registration (name ≥ 2 chars, valid email, password ≥ 6
  chars) and campaign creation (title required, brief ≥ 10 chars, valid URL
  if provided, tone required).
- Server-side re-validation on every mutating route (never trust client-only
  validation).

### Security
- Passwords hashed with bcrypt (10 rounds), never returned in API responses.
- JWT session strategy via NextAuth; `NEXTAUTH_SECRET` required in production.
- All campaign/variant queries scoped by `user_id` — no cross-user data
  leakage even with a guessed campaign ID.
- Gemini API key stored server-side only (`GEMINI_API_KEY`), never
  exposed to the client.
- Middleware protects all `/dashboard/*` routes; unauthenticated requests
  redirect to `/login`.

### Scalability notes
- Neon Postgres (serverless, pooled connections) via Prisma ORM is the
  production database — chosen after an earlier SQLite-based MVP hit a real
  constraint: Vercel's serverless functions have a read-only filesystem, so a
  file-based database like SQLite cannot persist writes in production. Prisma
  gives a typed data-access layer and connection pooling (via `DATABASE_URL`)
  suited to serverless functions, where each invocation may be a fresh
  connection.
- Stateless JWT sessions mean the app scales horizontally without a shared
  session store.

---

*This prompt was refined over several iterations — narrowing the AI's output
format to strict JSON, adding word-count constraints to keep ad copy usable,
and separating "why LLM and not RAG/agents" into an explicit justification, as
required by the assessment brief.*

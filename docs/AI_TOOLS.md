# AI Tools Used & Development Workflow — AdSpark

## Tools

- **Claude (Anthropic)** — requirement analysis, master prompt authoring,
  application scaffolding (Next.js/Prisma/NextAuth/API routes/UI),
  documentation (architecture, testing, mind map)
- **Google Gemini** — the in-app AI feature: generates ad-copy variants
  (headline, body, CTA) from a campaign brief and brand tone

## Workflow

1. **Requirement analysis** — identified the target user (small business
   marketer), the core job (brief → ready-to-use ad copy), and confirmed an
   LLM is the right-sized AI tool for a pure text-generation task (see
   `docs/MIND_MAP.md` for the full justification against RAG/CV/OCR/etc.)
2. **Master prompt** — wrote the full spec in `docs/MASTER_PROMPT.md`
   covering user roles, data model, workflows, AI integration, UI
   requirements, and validation before writing code
3. **AI-assisted development** — used the master prompt to scaffold the
   Next.js app: auth, campaign CRUD, Gemini integration, UI
4. **Iteration** — refined the Gemini prompt across several passes to
   improve tone differentiation between variants and enforce consistent
   structured output
5. **Testing** — functional, API, AI-feature, security, and responsive
   checks documented in `docs/TESTING.md`
6. **Deployment** — Vercel + Neon Postgres; live at
   https://adspark-submission.vercel.app

## Note on this document

This file, `docs/TESTING.md`, and `docs/MIND_MAP.md` were added as a
completeness pass after initial submission, specifically to cover the
testing approach, AI-tool workflow, and solution mind map/flow diagram
called for in the assessment brief that weren't part of the original
submission's docs folder.

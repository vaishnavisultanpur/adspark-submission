# AdSpark — Solution Mind Map

Sourced idea: **AdSpark** — AI ad-copy generator for SMBs (IdeaBrowser.com).

```mermaid
mindmap
  root((AdSpark))
    Users
      Marketer / Small business owner
        Create campaign brief
        Pick brand tone
        Generate ad variants
        Save/reuse best copy
    Core Features
      Auth (NextAuth, JWT)
      Campaign management
      AI ad-copy generation
      Variant history
    AI Value
      LLM (Gemini)
        Headline + body + CTA generation
        Tone conditioning
        Multiple variants per brief
      Why not RAG/CV/OCR
        No external knowledge base to retrieve from
        No image/document input in this workflow
        Pure generative text task — LLM alone is the right-sized tool
    Data
      User
      Campaign
      AdVariant
    Non-functional
      Security (bcrypt, zod, role scoping)
      Responsive UI
      Scalable stateless API routes
```

## Flow diagram

```mermaid
flowchart TD
    A[User logs in] --> B[Create campaign: product, audience, tone]
    B --> C[Click Generate ad copy]
    C --> D[Gemini generates 3 variants: headline, body, CTA]
    D --> E{Valid structured response?}
    E -- No --> F[Retry once]
    F --> D
    E -- Yes --> G[Variants saved to campaign history]
    G --> H[User reviews variants]
    H --> I{Good enough?}
    I -- No --> C
    I -- Yes --> J[User copies/exports chosen variant]
```

## AI justification (explicit, for assessment criteria)

AdSpark's core job — turning a short product brief into ready-to-use ad
copy — is a pure text-generation task. An **LLM** (Gemini) is the correctly
scoped tool:

- **RAG** was not used because there's no proprietary knowledge base the
  app needs to retrieve from; the brief itself is the only input the model
  needs.
- **Computer Vision / OCR** were not used because the workflow has no image
  or document input.
- **Predictive analytics / recommendation engines** were considered as a
  stretch feature (e.g. "which past variant performed best") but scoped out
  for the assessment timeline since there's no real performance data to
  learn from yet.

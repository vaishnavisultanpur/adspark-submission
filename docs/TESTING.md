# AdSpark — Testing & QA

## 1. Functional Testing

| Flow | Steps | Expected result |
|---|---|---|
| Register | New email/password | Account created, redirected to dashboard |
| Register (duplicate email) | Existing email | 409 with clear error, no duplicate row |
| Login | Correct credentials | Session created, redirect to dashboard |
| Login (wrong password) | Incorrect password | Generic error, no user enumeration |
| Create campaign | Fill product/audience/tone, submit | Campaign saved, appears in list |
| Generate ad copy | Click Generate on a campaign | 3 variants (headline/body/CTA) returned and displayed |
| Regenerate | Click Generate again | New variant set added to history, old ones retained |
| Empty/invalid brief | Submit with missing required fields | Client + server validation blocks submit with clear message |
| Sign out | Click sign out | Session cleared, protected routes redirect to login |

## 2. API Testing

Each mutating endpoint checked for:
- Missing/invalid body → 400 with field-level validation errors (zod)
- Missing session → 401
- Not-found resource (e.g. campaign belonging to another user) → 403/404
- Valid request → correct status + response shape

## 3. AI Feature Testing

- **Structured output validation**: Gemini's response is parsed against an
  expected shape (headline/body/CTA per variant) before being saved;
  malformed output is retried rather than silently saved broken
- **Tone conditioning check**: manually verified that switching brand tone
  (e.g. "playful" vs "professional") produces meaningfully different copy,
  not just superficial word swaps
- **Empty/short brief handling**: verified the model still returns usable
  output rather than erroring on a minimal input, and that obviously
  insufficient briefs are caught by client-side validation before reaching
  the API

## 4. UI/UX Validation

- Responsive check at mobile (375px), tablet (768px), desktop (1280px)
- Keyboard focus visible on all interactive elements
- Loading and empty states present for: no campaigns yet, generation in
  progress, generation failure

## 5. Security Testing

- Confirmed role/session checks happen server-side in API routes, not just
  hidden in the UI
- Confirmed campaign queries are scoped to the logged-in user
- Confirmed `passwordHash` is never included in any API response

## 6. Known Gaps / Not Yet Automated

- No automated test suite (Jest/Playwright) — testing above was manual,
  given the assessment timeline
- Cross-browser testing done primarily on Chromium; not exhaustively
  verified on Safari/Firefox edge cases
- No load/performance testing performed; flagged as a pre-production
  requirement since the Gemini call is on the critical path per generation

# Requirements Document — Go Viral Clone: AI Content Virality Analyzer

## Intent Analysis Summary

| Field | Value |
|---|---|
| **User Request** | Build a web app where creators upload content (video/image/caption) and receive an AI virality score with actionable feedback |
| **Request Type** | New Project (Greenfield) |
| **Scope Estimate** | Multiple Components (frontend, backend API, AI integration, auth, storage) |
| **Complexity Estimate** | Moderate-to-Complex (AI vision analysis, file uploads, structured scoring, auth) |
| **Reference App** | Go Viral: AI Creator Assistant (59M+ views) |

---

## Tech Stack Decisions

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | Free on Vercel, SSR/SSG, great DX |
| Styling | Tailwind CSS + shadcn/ui | Free, fast, accessible components |
| Backend | Next.js API Routes (Node.js/TypeScript) | Serverless on Vercel free tier, no separate server needed |
| Auth | Supabase Auth | Free tier (50,000 MAU), supports Google/email login |
| Database | Supabase PostgreSQL | Free tier (500MB), stores analysis history |
| File Storage | Supabase Storage | Free tier (1GB), stores uploaded media |
| AI — Vision/Video | Google Gemini 1.5 Flash API | Free tier: 15 RPM, 1M tokens/day — handles video, image, text |
| AI — Text Speed | Groq API (Llama 3.1 70B) | Free tier: 14,400 req/day — fast text generation for suggestions |
| Trending Hashtags | AI-generated via Gemini | No free real-time trending API exists; Gemini generates contextual hashtag/audio suggestions based on content analysis |
| Deployment | Vercel (frontend + API) | Free hobby tier |
| PBT Framework | fast-check (TypeScript) | Integrates with Vitest/Jest, supports custom generators, shrinking, seed reproducibility |

> **Note on Trending API (Q7)**: No free real-time trending API (TikTok, Instagram) exists for public use. The app will use Gemini to generate contextually relevant trending hashtag and audio suggestions based on the content's niche, tone, and platform — this is more reliable and always free.

---

## Functional Requirements

### FR-01: User Authentication
- Users can sign up and log in via email/password or Google OAuth (Supabase Auth)
- Authenticated users have a personal dashboard with analysis history
- Sessions persist across browser refreshes
- Users can log out

### FR-02: Content Upload
- Users can upload:
  - **Video files**: MP4, MOV, WebM — max 200MB, max 7 minutes duration
  - **Image files**: JPG, PNG, GIF, WebP — max 10MB
  - **Text captions**: Standalone text input (up to 2,200 characters, matching Instagram limit)
- Upload progress indicator shown during file transfer
- Files stored in Supabase Storage, linked to the user's account
- Platform selection required before analysis: TikTok / Instagram / YouTube Shorts

### FR-03: AI Virality Analysis
The system sends uploaded content to Gemini 1.5 Flash for multimodal analysis and returns a structured virality report.

**Analysis dimensions:**

| Dimension | Description |
|---|---|
| **Overall Virality Score** | 0–100 composite score |
| **Hook Strength** | Analysis of first 3 seconds (video) or first visual element (image) — score 0–100 |
| **Pacing & Retention** | Video pacing, cut frequency, engagement curve — score 0–100 (N/A for images) |
| **Thumbnail / Visual Appeal** | Composition, contrast, faces, text overlay quality — score 0–100 |
| **Caption Optimization** | Hook words, CTA presence, length, emoji usage — score 0–100 |
| **Audio Recommendation** | Suggested audio style/genre for the content (AI-generated, not real-time trending) |
| **Hashtag Recommendations** | 10–15 contextually relevant hashtags for the selected platform |
| **Platform Fit Score** | How well the content fits the selected platform's algorithm — score 0–100 |

### FR-04: Virality Score Breakdown UI
- Overall score displayed prominently (large animated number, 0–100)
- Sub-scores shown as visual progress bars or gauge charts per dimension
- Each dimension includes:
  - Score (0–100)
  - 2–3 sentence explanation of what works / what doesn't
  - 1–3 specific, actionable improvement suggestions
- Color coding: 0–40 red, 41–70 amber, 71–100 green

### FR-05: Analysis History
- Authenticated users can view past analyses in a dashboard
- Each history entry shows: thumbnail/preview, overall score, platform, date, content type
- Users can click any past analysis to view the full report
- History limited to last 20 analyses per user (free tier constraint)

### FR-06: Single Analysis Per Upload (v1)
- One analysis per upload — no re-scoring or side-by-side comparison in v1
- Future: re-upload and compare scores (noted for v2 roadmap)

### FR-07: Platform-Specific Guidance
- Analysis adapts to the selected platform (TikTok vs Instagram vs YouTube Shorts)
- Hashtag and audio suggestions are platform-specific
- Scoring weights adjust per platform (e.g., hook weight higher for TikTok)

---

## Non-Functional Requirements

### NFR-01: Performance
- Analysis results returned within 15 seconds for images/captions
- Analysis results returned within 30 seconds for videos up to 2 minutes
- Upload progress shown in real-time (chunked upload or presigned URL)
- Page load time < 2 seconds (Vercel edge network)

### NFR-02: Availability & Free Tier Constraints
- App operates within Gemini free tier: 15 RPM, 1M tokens/day
- App operates within Groq free tier: 14,400 req/day
- App operates within Supabase free tier: 500MB DB, 1GB storage, 50K MAU
- App operates within Vercel free tier: 100GB bandwidth/month, 100 serverless function invocations/day (hobby)
- Rate limiting enforced per user to prevent free tier exhaustion

### NFR-03: Security (Full Enforcement — SECURITY-01 through SECURITY-15)
- All data encrypted at rest (Supabase handles this) and in transit (TLS 1.2+)
- HTTP security headers enforced on all responses (CSP, HSTS, X-Frame-Options, etc.)
- Input validation on all API endpoints (file type, size, content type)
- Supabase Row Level Security (RLS) enforced — users can only access their own data
- API keys stored in environment variables, never in source code
- Rate limiting on all public-facing API routes
- Brute-force protection on auth endpoints (Supabase handles this)
- Sessions invalidated on logout
- No stack traces or internal errors exposed to users

### NFR-04: Usability & Accessibility
- WCAG 2.1 AA compliance target
- Mobile-responsive design (works on phones and tablets in browser)
- Drag-and-drop upload with fallback file picker
- Loading states and skeleton screens during analysis
- Error messages are user-friendly and actionable

### NFR-05: Maintainability
- TypeScript strict mode throughout
- ESLint + Prettier configured
- Environment variables documented in `.env.example`
- All dependencies pinned to exact versions (lock file committed)

### NFR-06: Scalability (Future)
- Architecture supports adding new AI providers without major refactoring
- Scoring dimensions configurable (weights per platform stored in config, not hardcoded)

---

## Property-Based Testing Requirements (Partial Enforcement — PBT-02, PBT-03, PBT-07, PBT-08, PBT-09)

PBT framework: **fast-check** (TypeScript, integrates with Vitest)

Applicable PBT targets:
- **Score normalization functions**: Invariant — output always in [0, 100] range
- **AI response parsing**: Round-trip — parsed score object serializes back to equivalent JSON
- **Caption analysis utilities**: Invariant — word count, character count functions
- **Platform weight calculators**: Invariant — weighted average always produces value in [0, 100]

---

## Out of Scope (v1)

| Feature | Status |
|---|---|
| Competitor content comparison | Deferred to v2 |
| Re-upload and side-by-side score comparison | Deferred to v2 |
| Real-time trending API integration | Replaced by AI-generated suggestions (free) |
| Mobile native app | Web-only for v1 |
| Long-form video (> 7 minutes) | Out of scope |
| Team/agency accounts | Out of scope |
| Export/share analysis report | Out of scope |

---

## Extension Configuration

| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline (SECURITY-01 to SECURITY-15) | Yes — Full Enforcement | Requirements Analysis |
| Property-Based Testing | Yes — Partial Enforcement (PBT-02, PBT-03, PBT-07, PBT-08, PBT-09) | Requirements Analysis |

---

## UI/UX Design Direction

| Aspect | Specification |
|---|---|
| **Design Style** | Neomorphism (soft UI) — premium, god-tier aesthetic |
| **Color Palette** | Dark neomorphism base (`#1a1a2e` / `#16213e`) with soft shadows and glows |
| **Shadow System** | Dual-shadow neomorphic: dark shadow (`rgba(0,0,0,0.5)`) + light highlight (`rgba(255,255,255,0.05)`) |
| **Accent Colors** | Electric purple `#7c3aed`, neon cyan `#06b6d4`, hot pink `#ec4899` for scores and highlights |
| **Typography** | Inter or Plus Jakarta Sans — clean, modern, premium feel |
| **Animations** | Framer Motion — score counter animations, card reveals, loading states |
| **Score Display** | Large animated circular gauge with gradient stroke for virality score |
| **Cards** | Neomorphic inset/outset cards for score breakdowns |
| **Glassmorphism accents** | Frosted glass overlays on modals and tooltips |

---

## Key Constraints Summary

1. **100% free stack** — every service used must have a usable free tier
2. **No real-time trending API** — AI-generated suggestions replace paid trending APIs
3. **Vercel + Supabase deployment** — no Docker, no VMs
4. **Node.js/TypeScript backend** — via Next.js API routes
5. **Single analysis per upload** in v1 — no re-scoring workflow
6. **Max video: 200MB / 7 minutes** — aligned with Gemini free tier capabilities
7. **Platform-agnostic with platform selection** — TikTok, Instagram, YouTube Shorts

# Units of Work — Go Viral Clone

## Decomposition Strategy

Single Next.js monorepo with two logical units of work, executed sequentially (Unit 2 depends on Unit 1's data contracts).

---

## UNIT-01: Foundation — Auth, Upload & Storage

**Description**: Everything needed before AI analysis can happen — project scaffold, design system, auth flows, file upload, and Supabase integration.

**Scope**:
- Next.js 14 project scaffold (TypeScript strict, ESLint, Prettier, Tailwind, shadcn/ui)
- Neomorphism design system (theme tokens, shadow utilities, base components)
- Supabase setup (auth, storage bucket, DB schema, RLS policies)
- Authentication flows (sign up, log in, Google OAuth, session management, protected routes)
- File upload UI + API (UploadDropzone, UploadHandler, StorageService)
- Navigation, Landing page, Auth page, Dashboard shell
- Environment configuration (.env.example, Vercel env vars)
- Rate limiting middleware (upstash-redis or in-memory for free tier)

**Key Components**: COMP-01, COMP-02, COMP-03 (shell), COMP-08, COMP-09, COMP-10, COMP-14
**Key Services**: SVC-02 (StorageService), SVC-04 (AuthService)
**Deliverable**: Deployable app on Vercel — users can sign up, log in, upload files, see empty dashboard

---

## UNIT-02: AI Analysis Engine & Results UI

**Description**: The core product — AI virality analysis pipeline, score display, history, and full results UI.

**Depends On**: UNIT-01 (auth session, storage URLs, DB connection, design system)

**Scope**:
- Gemini 1.5 Flash integration (multimodal: video, image, caption)
- Groq API integration (enhanced text suggestions)
- PromptBuilderService (platform-specific prompts + JSON schema)
- ScoreNormalizationService (score clamping, weighted averages)
- AIAnalysisService (full orchestration pipeline)
- AnalysisRepository (DB CRUD, RLS)
- AnalysisHandler API route (POST /api/analyze)
- HistoryHandler + AnalysisDetailHandler API routes
- UploadPage (complete — platform selector, caption input, analysis trigger)
- AnalysisResultPage (neomorphic score UI — gauge, breakdown cards, suggestions, hashtags)
- DashboardPage (complete — history list with scores)
- PBT tests for ScoreNormalizationService

**Key Components**: COMP-04, COMP-05, COMP-06, COMP-07, COMP-11, COMP-12, COMP-13
**Key Services**: SVC-01, SVC-03, SVC-05, SVC-06
**Deliverable**: Fully functional virality analyzer — upload → analyze → view score report

---

## Code Organization

```
go-viral-clone/                          # Workspace root (application code here)
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── auth/page.tsx            # COMP-02
│   │   ├── (protected)/
│   │   │   ├── dashboard/page.tsx       # COMP-03
│   │   │   ├── upload/page.tsx          # COMP-04
│   │   │   └── analysis/[id]/page.tsx   # COMP-05
│   │   ├── page.tsx                     # COMP-01 (Landing)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                          # shadcn/ui base components
│   │   ├── score-gauge.tsx              # COMP-06
│   │   ├── score-breakdown-card.tsx     # COMP-07
│   │   ├── upload-dropzone.tsx          # COMP-08
│   │   └── navigation-bar.tsx           # COMP-09
│   ├── lib/
│   │   ├── services/
│   │   │   ├── ai-analysis.service.ts   # SVC-01
│   │   │   ├── storage.service.ts       # SVC-02
│   │   │   ├── auth.service.ts          # SVC-04
│   │   │   ├── score-normalization.service.ts  # SVC-05
│   │   │   └── prompt-builder.service.ts       # SVC-06
│   │   ├── repositories/
│   │   │   └── analysis.repository.ts   # SVC-03
│   │   ├── supabase/
│   │   │   ├── client.ts                # Browser Supabase client
│   │   │   └── server.ts                # Server Supabase client
│   │   ├── middleware/
│   │   │   └── rate-limit.ts            # COMP-14
│   │   └── types/
│   │       └── index.ts                 # Shared TypeScript types
│   └── app/api/
│       ├── upload/route.ts              # COMP-10
│       ├── analyze/route.ts             # COMP-11
│       ├── history/route.ts             # COMP-12
│       └── analysis/[id]/route.ts       # COMP-13
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql       # DB schema + RLS policies
├── tests/
│   ├── unit/
│   │   ├── score-normalization.test.ts  # PBT + example tests
│   │   └── prompt-builder.test.ts
│   └── integration/
│       └── analysis-api.test.ts
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

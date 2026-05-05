# Code Generation Plan — UNIT-01: Foundation

## Unit Context
- **Stories**: S-01 to S-09, N-01 to N-08, N-11, N-12 (partial)
- **Dependencies**: None (starting unit)
- **Workspace Root**: D:\AWS - workshop\go-viral-clone

---

## Steps

- [ ] **Step 1: Project Scaffold**
  - [ ] 1.1 Initialize Next.js 14 with TypeScript: `npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [ ] 1.2 Install dependencies (exact versions):
    - `@supabase/ssr@0.5.2`, `@supabase/supabase-js@2.49.4`
    - `framer-motion@11.18.2`, `lucide-react@0.511.0`
    - `zod@3.24.4`, `pino@9.6.0`, `pino-pretty@13.0.0`
    - `fast-check@3.23.2`, `vitest@3.1.3`, `@vitejs/plugin-react@4.4.1`
    - `@testing-library/react@16.3.0`, `@testing-library/jest-dom@6.6.3`
  - [ ] 1.3 Install shadcn/ui: `npx shadcn@latest init` (dark theme, CSS variables)
  - [ ] 1.4 Add shadcn components: `button`, `card`, `input`, `label`, `tabs`, `badge`, `progress`, `separator`, `avatar`, `dropdown-menu`, `accordion`, `skeleton`, `toast`
  - [ ] 1.5 Configure `tsconfig.json` (strict mode, path aliases)
  - [ ] 1.6 Configure `vitest.config.ts`
  - [ ] 1.7 Configure `.env.example`
  - [ ] 1.8 Configure `next.config.ts` (security headers)
  - [ ] 1.9 Configure `vercel.json` (function timeouts)

- [ ] **Step 2: Tailwind Neomorphism Design System**
  - [ ] 2.1 Update `tailwind.config.ts` with neomorphism tokens (colors, shadows, fonts)
  - [ ] 2.2 Update `src/app/globals.css` (CSS variables, base styles, dark background)
  - [ ] 2.3 Create `src/lib/utils/design.ts` (score color utilities: `getScoreColor`, `getScoreGradient`)

- [ ] **Step 3: Supabase Setup**
  - [ ] 3.1 Create `src/lib/supabase/client.ts` (browser Supabase client)
  - [ ] 3.2 Create `src/lib/supabase/server.ts` (server Supabase client for API routes)
  - [ ] 3.3 Create `src/lib/supabase/middleware.ts` (middleware Supabase client)
  - [ ] 3.4 Create `supabase/migrations/001_initial_schema.sql` (analyses table, rate_limits table, RLS policies, indexes)

- [ ] **Step 4: TypeScript Types**
  - [ ] 4.1 Create `src/lib/types/index.ts` (all shared types: MediaType, Platform, User, Session, UploadedFile, Analysis, ViralityScore, DimensionScore, AnalysisInput, AnalysisSummary, RateLimitResult)

- [ ] **Step 5: Auth Service + Middleware**
  - [ ] 5.1 Create `src/lib/services/auth.service.ts` (getUser, getSession — server-side)
  - [ ] 5.2 Create `src/middleware.ts` (Next.js middleware — protect routes, refresh session)
  - [ ] 5.3 Create `src/app/auth/callback/route.ts` (OAuth callback handler)

- [ ] **Step 6: Storage Service**
  - [ ] 6.1 Create `src/lib/services/storage.service.ts` (uploadFile, getSignedUrl, deleteFile, validateFileType, validateFileSize)

- [ ] **Step 7: Rate Limit Middleware**
  - [ ] 7.1 Create `src/lib/middleware/rate-limit.ts` (checkRateLimit, buildRateLimitResponse)

- [ ] **Step 8: Logging Setup**
  - [ ] 8.1 Create `src/lib/logger.ts` (pino logger with structured output, correlation ID support)

- [ ] **Step 9: Upload API Route**
  - [ ] 9.1 Create `src/app/api/upload/route.ts` (POST handler: auth check → rate limit → Zod validate → StorageService.uploadFile → return storagePath + signedUrl)

- [ ] **Step 10: Navigation Component**
  - [ ] 10.1 Create `src/components/navigation-bar.tsx` (neomorphic nav, auth state, mobile menu, data-testid, ARIA)

- [ ] **Step 11: Landing Page**
  - [ ] 11.1 Create `src/app/page.tsx` (hero, feature grid, static score preview, CTA, neomorphism styling)

- [ ] **Step 12: Auth Page**
  - [ ] 12.1 Create `src/app/auth/page.tsx` (login/signup tabs, email+password, Google OAuth, Supabase client, error handling, neomorphism card)

- [ ] **Step 13: Dashboard Shell**
  - [ ] 13.1 Create `src/app/(protected)/dashboard/page.tsx` (welcome header, New Analysis CTA, empty state — history populated in UNIT-02)

- [ ] **Step 14: Upload Dropzone Component**
  - [ ] 14.1 Create `src/components/upload-dropzone.tsx` (drag-drop, file picker, preview, progress bar, validation, data-testid, ARIA)

- [ ] **Step 15: Upload Page (upload portion)**
  - [ ] 15.1 Create `src/app/(protected)/upload/page.tsx` (platform selector, UploadDropzone, caption textarea, Analyze button — analysis trigger in UNIT-02)

- [ ] **Step 16: Protected Layout**
  - [ ] 16.1 Create `src/app/(protected)/layout.tsx` (auth guard — redirect to /auth if no session)

- [ ] **Step 17: Root Layout**
  - [ ] 17.1 Create `src/app/layout.tsx` (NavigationBar, Toaster, font setup, metadata)

- [ ] **Step 18: Unit Tests — UNIT-01**
  - [ ] 18.1 Create `tests/unit/storage.service.test.ts` (validateFileType, validateFileSize — example-based)
  - [ ] 18.2 Create `tests/unit/rate-limit.test.ts` (checkRateLimit logic — example-based)
  - [ ] 18.3 Create `tests/unit/auth.service.test.ts` (getUser mock tests)

- [ ] **Step 19: Documentation**
  - [ ] 19.1 Create `aidlc-docs/construction/unit-01-foundation/code/unit-01-summary.md` (files created, key decisions)
  - [ ] 19.2 Update `README.md` (project overview, setup instructions, env vars)

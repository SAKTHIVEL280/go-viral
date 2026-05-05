# Tech Stack Decisions — UNIT-01: Foundation

| Concern | Decision | Version | Rationale |
|---|---|---|---|
| Framework | Next.js (App Router) | 14.2.x | SSR, API routes, middleware, Vercel-native |
| Language | TypeScript | 5.x | Strict mode, type safety |
| Styling | Tailwind CSS | 3.4.x | Utility-first, custom neomorphism tokens |
| Components | shadcn/ui | latest | Accessible, unstyled base, customizable |
| Animation | Framer Motion | 11.x | Score gauge animation, page transitions |
| Auth | @supabase/ssr | 0.x | Server-side session management |
| Storage | @supabase/supabase-js | 2.x | Storage + DB client |
| Validation | Zod | 3.x | Runtime schema validation on API routes |
| Logging | pino | 9.x | Structured JSON logging, fast |
| PBT Framework | fast-check | 3.x | TypeScript PBT, Vitest integration |
| Testing | Vitest | 1.x | Fast, TypeScript-native |
| Linting | ESLint + eslint-config-next | latest | Next.js recommended config |
| Formatting | Prettier | 3.x | Consistent code style |
| Rate Limiting | Custom Supabase table | — | Free, no extra service needed |

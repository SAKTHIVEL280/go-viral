# GoViral — AI Content Virality Analyzer

Upload your video, image, or caption and get an AI-powered virality score with actionable feedback to maximize your reach on TikTok, Instagram, and YouTube Shorts.

## Features

- **Virality Score (0–100)** — weighted composite across 5 dimensions
- **Hook Analysis** — first 3 seconds scored and explained
- **Pacing & Retention** — cut frequency and energy analysis (video)
- **Visual Appeal** — composition, contrast, thumbnail potential
- **Caption Optimization** — hook words, CTA, emoji usage
- **Platform Fit** — algorithm alignment for TikTok / Instagram / YouTube Shorts
- **Hashtag Engine** — 10–15 platform-specific hashtags generated
- **Audio Suggestions** — AI-recommended audio style
- **Analysis History** — last 20 analyses saved per user
- **Neomorphism UI** — premium dark soft-UI design

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui + Framer Motion |
| Auth | Supabase Auth (email + Google OAuth) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI Vision | Google Gemini 1.5 Flash (free tier) |
| AI Text | Groq Llama 3.1 70B (free tier) |
| Deployment | Vercel |
| Testing | Vitest + fast-check (PBT) |

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd go-viral-clone
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as above (keep secret!) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local dev |

### 3. Supabase setup

1. Create a new Supabase project
2. Run the migration in `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Create a storage bucket named `media-uploads` (set to **private**)
4. Add storage RLS policies (see comments in the migration file)
5. Enable Google OAuth in Authentication → Providers (optional)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run all tests (vitest)
npm run lint         # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── (protected)/          # Auth-gated pages
│   │   ├── dashboard/        # Analysis history
│   │   ├── upload/           # Content upload + analysis trigger
│   │   └── analysis/[id]/    # Full score report
│   ├── api/                  # API routes
│   │   ├── upload/           # File upload to Supabase Storage
│   │   ├── analyze/          # AI analysis pipeline
│   │   ├── history/          # User analysis history
│   │   └── analysis/[id]/    # Single analysis detail
│   ├── auth/                 # Auth pages + OAuth callback
│   └── page.tsx              # Landing page
├── components/
│   ├── score-gauge.tsx       # Animated circular score display
│   ├── score-breakdown-card.tsx  # Per-dimension score card
│   ├── upload-dropzone.tsx   # Drag-and-drop file upload
│   └── navigation-bar.tsx    # Top nav with auth state
├── lib/
│   ├── ai/                   # Gemini + Groq clients
│   ├── services/             # Business logic services
│   ├── repositories/         # Data access layer
│   ├── supabase/             # Supabase client setup
│   ├── middleware/           # Rate limiting
│   └── types/                # Shared TypeScript types
supabase/
└── migrations/               # Database schema + RLS policies
tests/
└── unit/                     # Unit + PBT tests
```

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Set all environment variables in the Vercel dashboard under Settings → Environment Variables.

## Free Tier Limits

| Service | Free Limit |
|---|---|
| Gemini 1.5 Flash | 15 RPM, 1M tokens/day |
| Groq | 14,400 req/day |
| Supabase | 500MB DB, 1GB storage, 50K MAU |
| Vercel | 100GB bandwidth/month |

The app enforces a **5 analyses per hour per user** rate limit to stay well within these limits.

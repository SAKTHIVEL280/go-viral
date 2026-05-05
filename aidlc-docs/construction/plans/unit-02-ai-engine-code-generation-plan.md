# Code Generation Plan — UNIT-02: AI Engine

## Unit Context
- **Stories**: S-10 to S-24, N-05, N-07 to N-12
- **Dependencies**: UNIT-01 (auth, storage, design system, types, DB connection)
- **Workspace Root**: D:\AWS - workshop\go-viral-clone

---

## Steps

- [ ] **Step 1: AI Client Setup**
  - [ ] 1.1 Install AI dependencies: `@google/generative-ai@0.24.1`, `groq-sdk@0.13.0`
  - [ ] 1.2 Create `src/lib/ai/gemini.ts` (GoogleGenerativeAI client, geminiFlash model config)
  - [ ] 1.3 Create `src/lib/ai/groq.ts` (Groq client config)
  - [ ] 1.4 Add to `.env.example`: `GEMINI_API_KEY`, `GROQ_API_KEY`

- [ ] **Step 2: Prompt Builder Service**
  - [ ] 2.1 Create `src/lib/services/prompt-builder.service.ts`
    - `buildPrompt(input: AnalysisInput): GeminiPrompt`
    - `getPlatformWeights(platform: Platform): PlatformWeights`
    - `buildOutputSchema(): string`
    - Platform-specific scoring criteria injected into prompt
    - JSON output schema enforced in prompt

- [ ] **Step 3: Score Normalization Service**
  - [ ] 3.1 Create `src/lib/services/score-normalization.service.ts`
    - `clampScore(value: number): number` — Math.max(0, Math.min(100, Math.round(value)))
    - `computeWeightedScore(scores, platform): number`
    - `getAdjustedWeights(platform, scores): Record<string, number>` — redistributes weights for null dimensions
    - `normalize(rawScores, platform): ViralityScore`
    - `validateScoreCompleteness(scores): ValidationResult`

- [ ] **Step 4: PBT Tests — Score Normalization**
  - [ ] 4.1 Create `tests/unit/score-normalization.pbt.test.ts`
    - `clampScore` invariant: output always in [0, 100] (fast-check, seed=42, 1000 runs)
    - `computeWeightedScore` invariant: output always in [0, 100]
    - `getAdjustedWeights` invariant: weights sum to 1.0
    - Domain-specific generators for DimensionScores and Platform (PBT-07)
  - [ ] 4.2 Create `tests/unit/score-normalization.test.ts`
    - Example-based tests: known inputs → expected outputs
    - Edge cases: score=0, score=100, score=-1, score=101, score=NaN

- [ ] **Step 5: AI Analysis Service**
  - [ ] 5.1 Create `src/lib/services/ai-analysis.service.ts`
    - `analyzeContent(input: AnalysisInput): Promise<ViralityReport>`
    - `callGeminiVision(prompt, mediaUrl, mediaType): Promise<RawGeminiResponse>` (with 1 retry on 429)
    - `callGroqText(prompt): Promise<string>` (with silent fallback)
    - `parseGeminiResponse(raw): RawScores` (Zod validation of AI JSON output)
    - `mergeAnalysisResults(scores, suggestions): ViralityReport`

- [ ] **Step 6: Analysis Repository**
  - [ ] 6.1 Create `src/lib/repositories/analysis.repository.ts`
    - `save(analysis: NewAnalysis): Promise<Analysis>`
    - `findById(id: string): Promise<Analysis | null>`
    - `findByUser(userId: string, limit: number): Promise<AnalysisSummary[]>`
    - `countRecentByUser(userId: string, windowMinutes: number): Promise<number>`
    - `deleteOldest(userId: string): Promise<void>` (for overflow management)
    - `saveWithOverflowCheck(analysis: NewAnalysis): Promise<Analysis>` (auto-delete oldest if ≥20)

- [ ] **Step 7: Analyze API Route**
  - [ ] 7.1 Create `src/app/api/analyze/route.ts`
    - POST handler: auth → rate limit → Zod validate → StorageService.getSignedUrl → AIAnalysisService.analyzeContent → AnalysisRepository.saveWithOverflowCheck → return { analysisId }
    - Global error handler (SECURITY-15)
    - Structured logging with correlation ID (SECURITY-03)

- [ ] **Step 8: History API Route**
  - [ ] 8.1 Create `src/app/api/history/route.ts`
    - GET handler: auth → AnalysisRepository.findByUser(userId, 20) → return analyses

- [ ] **Step 9: Analysis Detail API Route**
  - [ ] 9.1 Create `src/app/api/analysis/[id]/route.ts`
    - GET handler: auth → AnalysisRepository.findById(id) → if null return 404 → return analysis
    - RLS enforces ownership (Supabase returns null for non-owner rows)

- [ ] **Step 10: Score Gauge Component**
  - [ ] 10.1 Create `src/components/score-gauge.tsx`
    - SVG circular progress ring
    - Framer Motion: animate strokeDashoffset + score counter on mount
    - Color-coded by score range (red/amber/green)
    - Neomorphic outer ring
    - Props: score, label, size, animated
    - data-testid, ARIA attributes

- [ ] **Step 11: Score Breakdown Card Component**
  - [ ] 11.1 Create `src/components/score-breakdown-card.tsx`
    - Neomorphic outset card
    - Animated progress bar (Framer Motion)
    - Accordion for suggestions (shadcn Accordion)
    - Color-coded score badge
    - data-testid, ARIA attributes

- [ ] **Step 12: Analysis Result Page**
  - [ ] 12.1 Create `src/app/(protected)/analysis/[id]/page.tsx`
    - Fetch analysis on mount (GET /api/analysis/[id])
    - Overall ScoreGauge (lg, animated)
    - 5× ScoreBreakdownCard grid
    - Hashtag pills section
    - Audio suggestion card
    - Back to dashboard button
    - Loading skeleton (shadcn Skeleton)
    - Error state

- [ ] **Step 13: Dashboard Page (complete)**
  - [ ] 13.1 Update `src/app/(protected)/dashboard/page.tsx`
    - Fetch history (GET /api/history)
    - Analysis grid with mini ScoreGauge (sm)
    - Platform + content type badges
    - Empty state illustration
    - Loading skeleton grid

- [ ] **Step 14: Upload Page (complete — analysis trigger)**
  - [ ] 14.1 Update `src/app/(protected)/upload/page.tsx`
    - Add POST /api/analyze call after upload success
    - Analysis loading overlay (animated, cycling messages)
    - Navigate to /analysis/[id] on success

- [ ] **Step 15: PBT Tests — AI Response Parsing**
  - [ ] 15.1 Create `tests/unit/ai-response-parsing.pbt.test.ts`
    - Round-trip: `JSON.parse(JSON.stringify(viralityScore))` equals original (PBT-02)
    - Domain generator for ViralityScore (PBT-07)
    - Seed=42, 500 runs

- [ ] **Step 16: Integration Tests**
  - [ ] 16.1 Create `tests/integration/analysis-api.test.ts`
    - Mock Gemini + Groq responses
    - Test full POST /api/analyze flow
    - Test ownership enforcement (GET /api/analysis/[id] with wrong user)
    - Test rate limiting (6th request returns 429)

- [ ] **Step 17: Documentation**
  - [ ] 17.1 Create `aidlc-docs/construction/unit-02-ai-engine/code/unit-02-summary.md`
  - [ ] 17.2 Update `README.md` (AI setup instructions, Gemini + Groq API key setup)

# Component Definitions — Go Viral Clone

## Frontend Components (Next.js App Router)

### COMP-01: LandingPage
- **Purpose**: Marketing/entry page for unauthenticated users
- **Responsibilities**: Display product value proposition, CTA to sign up/log in, showcase sample score UI
- **Interface**: Route `/` — public, no auth required

### COMP-02: AuthPage
- **Purpose**: Sign up / log in via Supabase Auth
- **Responsibilities**: Email/password auth, Google OAuth, redirect to dashboard on success
- **Interface**: Route `/auth` — public

### COMP-03: DashboardPage
- **Purpose**: Authenticated user home — analysis history + new upload CTA
- **Responsibilities**: List past analyses (last 20), show overall scores, link to full reports, trigger new analysis
- **Interface**: Route `/dashboard` — protected

### COMP-04: UploadPage
- **Purpose**: Content upload and platform selection
- **Responsibilities**: Drag-and-drop / file picker for video/image, caption text input, platform selector (TikTok/Instagram/YouTube Shorts), upload progress, trigger analysis
- **Interface**: Route `/upload` — protected

### COMP-05: AnalysisResultPage
- **Purpose**: Display full virality analysis report
- **Responsibilities**: Render overall score (animated gauge), sub-score breakdowns, actionable suggestions per dimension, hashtag/audio recommendations
- **Interface**: Route `/analysis/[id]` — protected, owner-only

### COMP-06: ScoreGauge (UI Component)
- **Purpose**: Animated circular score display (0–100)
- **Responsibilities**: Animate score counter on mount, color-code by range (red/amber/green), neomorphic styling
- **Interface**: `<ScoreGauge score={number} label={string} />`

### COMP-07: ScoreBreakdownCard (UI Component)
- **Purpose**: Per-dimension score card with suggestions
- **Responsibilities**: Show dimension name, score bar, explanation text, 1–3 actionable suggestions, neomorphic inset/outset styling
- **Interface**: `<ScoreBreakdownCard dimension={ScoreDimension} />`

### COMP-08: UploadDropzone (UI Component)
- **Purpose**: Drag-and-drop file upload area
- **Responsibilities**: Accept video/image files, validate type and size, show preview, upload progress bar
- **Interface**: `<UploadDropzone onFileSelect={fn} accept={string[]} maxSize={number} />`

### COMP-09: NavigationBar (UI Component)
- **Purpose**: Top navigation with auth state
- **Responsibilities**: Show logo, nav links, user avatar/logout, neomorphic styling
- **Interface**: `<NavigationBar user={User | null} />`

---

## Backend API Components (Next.js API Routes)

### COMP-10: UploadHandler
- **Purpose**: Handle file upload to Supabase Storage
- **Responsibilities**: Validate file type/size, generate unique storage path, upload to Supabase Storage bucket, return storage URL
- **Interface**: `POST /api/upload` — multipart/form-data

### COMP-11: AnalysisHandler
- **Purpose**: Orchestrate AI analysis pipeline
- **Responsibilities**: Receive upload metadata + caption + platform, call AIAnalysisService, persist result to DB, return analysis ID
- **Interface**: `POST /api/analyze` — JSON body

### COMP-12: HistoryHandler
- **Purpose**: Retrieve user's analysis history
- **Responsibilities**: Query Supabase for user's analyses (last 20), return paginated list with thumbnails and scores
- **Interface**: `GET /api/history` — authenticated

### COMP-13: AnalysisDetailHandler
- **Purpose**: Retrieve single analysis report
- **Responsibilities**: Fetch full analysis by ID, verify ownership (RLS), return complete score object
- **Interface**: `GET /api/analysis/[id]` — authenticated, owner-only

### COMP-14: RateLimitMiddleware
- **Purpose**: Protect API routes from abuse and free-tier exhaustion
- **Responsibilities**: Track requests per user per minute, enforce limits (5 analyses/hour per user), return 429 on breach
- **Interface**: Middleware applied to `/api/analyze` and `/api/upload`

---

## Service Layer

### SVC-01: AIAnalysisService
- **Purpose**: Core AI orchestration — sends content to Gemini + Groq, parses structured response
- **Responsibilities**: Build multimodal prompt for Gemini 1.5 Flash, parse JSON score response, call Groq for enhanced text suggestions, normalize scores to [0,100], return ViralityReport object
- **Interface**: `analyzeContent(input: AnalysisInput): Promise<ViralityReport>`

### SVC-02: StorageService
- **Purpose**: Abstraction over Supabase Storage
- **Responsibilities**: Upload file, generate signed URL, delete file, validate bucket policies
- **Interface**: `uploadFile(file, path): Promise<string>`, `getSignedUrl(path): Promise<string>`

### SVC-03: AnalysisRepository
- **Purpose**: Data access layer for analysis records
- **Responsibilities**: Insert new analysis, fetch by ID, fetch user history, enforce RLS via Supabase client
- **Interface**: `save(analysis): Promise<Analysis>`, `findById(id): Promise<Analysis>`, `findByUser(userId, limit): Promise<Analysis[]>`

### SVC-04: AuthService
- **Purpose**: Supabase Auth wrapper
- **Responsibilities**: Get current session, validate JWT, get user profile
- **Interface**: `getSession(): Promise<Session | null>`, `getUser(): Promise<User | null>`

### SVC-05: ScoreNormalizationService
- **Purpose**: Normalize and validate AI-returned scores
- **Responsibilities**: Clamp all scores to [0,100], compute weighted overall score per platform, validate score object completeness
- **Interface**: `normalize(rawScores: RawScores, platform: Platform): ViralityScore`

### SVC-06: PromptBuilderService
- **Purpose**: Build platform-specific analysis prompts for Gemini
- **Responsibilities**: Select platform-specific scoring weights, inject content metadata, build structured JSON-output prompt
- **Interface**: `buildPrompt(input: AnalysisInput): GeminiPrompt`

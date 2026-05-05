# Frontend Components — UNIT-02: AI Engine

## AnalysisResultPage (`/analysis/[id]`)
**State**: `{ analysis: Analysis | null, loading: boolean, error: string | null }`
**Data Fetch**: `GET /api/analysis/[id]` on mount
**Sections**:
1. Header: platform badge, content type badge, date
2. Overall score: large `ScoreGauge` (animated on mount)
3. Score grid: `ScoreBreakdownCard` × 5 dimensions (2-col on desktop, 1-col mobile)
4. Hashtags section: pill badges for each hashtag
5. Audio suggestion: styled card with music note icon
6. Back to dashboard button

**Auth**: Protected, owner-only (404 if not owner)

---

## ScoreGauge
**Props**:
```typescript
{
  score: number          // 0–100
  label: string          // e.g. "Virality Score"
  size?: 'sm' | 'md' | 'lg'  // default 'lg'
  animated?: boolean     // default true
}
```
**Implementation**:
- SVG circular progress ring
- Framer Motion: animate strokeDashoffset from 0 to final value on mount (1.2s ease-out)
- Framer Motion: animate score counter from 0 to final value (1s)
- Color: red gradient (0–40), amber gradient (41–70), green gradient (71–100)
- Neomorphic outer ring shadow
- Score number centered in large bold font

**data-testid**: `score-gauge`, `score-gauge-value`, `score-gauge-ring`
**ARIA**: `role="img"`, `aria-label="Virality score: {score} out of 100"`

---

## ScoreBreakdownCard
**Props**:
```typescript
{
  dimension: {
    name: string
    score: number
    explanation: string
    suggestions: string[]
    icon: string          // emoji or icon name
  }
}
```
**Layout**:
- Neomorphic outset card
- Top: dimension name + icon + score badge (color-coded)
- Middle: horizontal progress bar (animated width on mount)
- Bottom: explanation text (muted)
- Expandable: "Suggestions" section (accordion, closed by default)
  - 1–3 bullet points with actionable suggestions
  - Each suggestion has a checkmark icon

**data-testid**: `score-card-{dimension}`, `score-card-{dimension}-score`, `score-card-{dimension}-suggestions`
**ARIA**: `aria-expanded` on suggestions accordion

---

## DashboardPage (complete — UNIT-02)
**State**: `{ analyses: AnalysisSummary[], loading: boolean }`
**Data Fetch**: `GET /api/history` on mount
**Sections**:
- Header: "Your Analyses" + "New Analysis" button
- Analysis grid (2-col desktop, 1-col mobile):
  - Each card: media thumbnail/type icon, platform badge, overall score gauge (sm), date
  - Click → navigate to `/analysis/[id]`
- Empty state: illustration + "Upload your first content to get started"

**data-testid**: `dashboard-analysis-grid`, `dashboard-analysis-card-{id}`, `dashboard-new-analysis-btn`

---

## UploadPage (complete — UNIT-02 additions)
**Additional State**: `{ analyzing: boolean, analysisId: string | null }`
**Additional Behavior**:
- After upload success → `POST /api/analyze` with storagePath + platform + caption
- Show analysis loading state (animated spinner + "AI is analyzing your content...")
- On success → navigate to `/analysis/[analysisId]`
- On error → show error message, allow retry

**Loading State UI**:
- Full-screen overlay with neomorphic card
- Animated pulsing AI brain icon
- Progress messages cycling: "Analyzing hook strength...", "Checking pacing...", "Generating hashtags..."
- Framer Motion stagger animation on messages

---

## Neomorphism Component Patterns

### Score Color Utility
```typescript
function getScoreColor(score: number): string {
  if (score <= 40) return '#ef4444'   // red-500
  if (score <= 70) return '#f59e0b'   // amber-500
  return '#22c55e'                     // green-500
}

function getScoreGradient(score: number): string {
  if (score <= 40) return 'from-red-500 to-red-700'
  if (score <= 70) return 'from-amber-400 to-orange-500'
  return 'from-green-400 to-emerald-600'
}
```

### Neomorphic Card Classes (Tailwind)
```
// Outset card (raised)
className="bg-neo-surface rounded-2xl shadow-neo-out p-6"

// Inset card (pressed/active)
className="bg-neo-surface rounded-2xl shadow-neo-in p-6"

// Glowing accent card
className="bg-neo-surface rounded-2xl shadow-neo-out shadow-neo-glow-purple p-6"
```

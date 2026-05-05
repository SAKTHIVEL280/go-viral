# Frontend Components — UNIT-01: Foundation

## LandingPage (`/`)
**State**: None (static)
**Props**: None
**Sections**:
- Hero: headline, sub-headline, CTA button → `/auth`
- Feature grid: 4 cards (Upload, AI Score, Hook Analysis, Suggestions)
- Sample score preview (static neomorphic gauge at 87)
- Footer

**API Integration**: None
**Auth**: Public

---

## AuthPage (`/auth`)
**State**: `{ mode: 'login' | 'signup', email: string, password: string, loading: boolean, error: string | null }`
**Props**: None
**Sections**:
- Neomorphic card centered on page
- Tab toggle: Login / Sign Up
- Email + password inputs
- Google OAuth button (Supabase)
- Error message display
- Redirect to `/dashboard` on success

**Validation Rules**:
- Email: valid email format (regex)
- Password: min 8 characters
- Show inline validation errors on blur

**API Integration**: Supabase Auth client (browser-side)
**Auth**: Public (redirect to `/dashboard` if already authenticated)

---

## NavigationBar
**State**: `{ user: User | null, menuOpen: boolean }`
**Props**: None (reads from Supabase auth context)
**Elements**:
- Logo (left) — links to `/`
- Nav links: Dashboard, New Analysis
- User avatar + dropdown (right): Profile email, Logout
- Mobile: hamburger menu

**data-testid**: `nav-logo`, `nav-dashboard-link`, `nav-new-analysis-link`, `nav-user-menu`, `nav-logout-button`
**ARIA**: `role="navigation"`, `aria-label="Main navigation"`

---

## DashboardPage (`/dashboard`) — Shell only in UNIT-01
**State**: `{ loading: boolean }`
**Props**: None
**Sections**:
- Welcome header with user name
- "New Analysis" CTA button → `/upload`
- Empty state illustration + message (history populated in UNIT-02)

**Auth**: Protected — redirect to `/auth` if no session

---

## UploadPage (`/upload`) — Upload portion only in UNIT-01
**State**:
```typescript
{
  file: File | null,
  caption: string,
  platform: Platform | null,
  uploadProgress: number,        // 0–100
  uploadedPath: string | null,
  uploading: boolean,
  error: string | null
}
```
**Sections**:
- Platform selector (3 buttons: TikTok / Instagram / YouTube Shorts) — required
- UploadDropzone component
- Caption textarea (optional, max 2,200 chars, char counter)
- "Analyze" button (disabled until file + platform selected)

**Validation**:
- Platform must be selected before enabling Analyze button
- File type + size validated client-side before upload (mirrors server validation)
- Caption max 2,200 chars enforced

**API Integration**: `POST /api/upload` (multipart), then `POST /api/analyze` (UNIT-02)
**Auth**: Protected

---

## UploadDropzone
**Props**:
```typescript
{
  onFileSelect: (file: File) => void
  accept: string[]               // ['video/mp4', 'video/quicktime', ...]
  maxSizeBytes: number
  uploading: boolean
  progress: number               // 0–100
  preview: string | null         // Object URL for preview
}
```
**Behavior**:
- Drag-and-drop zone with dashed neomorphic border
- Click to open file picker
- Show file preview (video thumbnail or image preview) after selection
- Show progress bar during upload
- Show error if wrong type or too large

**data-testid**: `upload-dropzone`, `upload-file-input`, `upload-progress-bar`, `upload-preview`
**ARIA**: `role="button"`, `aria-label="Upload file"`, `aria-describedby="upload-instructions"`

---

## Neomorphism Design System Tokens (Tailwind config)

```typescript
// tailwind.config.ts additions
{
  theme: {
    extend: {
      colors: {
        'neo-base': '#1a1a2e',
        'neo-surface': '#16213e',
        'neo-accent-purple': '#7c3aed',
        'neo-accent-cyan': '#06b6d4',
        'neo-accent-pink': '#ec4899',
        'neo-text': '#e2e8f0',
        'neo-text-muted': '#94a3b8',
      },
      boxShadow: {
        'neo-out': '6px 6px 12px rgba(0,0,0,0.5), -6px -6px 12px rgba(255,255,255,0.03)',
        'neo-in': 'inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(255,255,255,0.03)',
        'neo-out-sm': '3px 3px 6px rgba(0,0,0,0.4), -3px -3px 6px rgba(255,255,255,0.03)',
        'neo-glow-purple': '0 0 20px rgba(124,58,237,0.4)',
        'neo-glow-cyan': '0 0 20px rgba(6,182,212,0.4)',
      }
    }
  }
}
```

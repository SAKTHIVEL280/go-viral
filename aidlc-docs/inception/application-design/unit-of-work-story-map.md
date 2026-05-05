# Unit of Work Story Map — Go Viral Clone

## Functional Story → Unit Mapping

| Story | Description | Unit |
|---|---|---|
| S-01 | User signs up with email/password | UNIT-01 |
| S-02 | User logs in with Google OAuth | UNIT-01 |
| S-03 | User session persists across refreshes | UNIT-01 |
| S-04 | User logs out | UNIT-01 |
| S-05 | User sees landing page with product value prop | UNIT-01 |
| S-06 | User uploads a video file (drag-and-drop) | UNIT-01 |
| S-07 | User uploads an image file | UNIT-01 |
| S-08 | User sees upload progress indicator | UNIT-01 |
| S-09 | User selects target platform (TikTok/Instagram/YouTube Shorts) | UNIT-01 |
| S-10 | User enters a caption for analysis | UNIT-02 |
| S-11 | User triggers AI analysis and sees loading state | UNIT-02 |
| S-12 | User sees overall virality score (0–100, animated gauge) | UNIT-02 |
| S-13 | User sees hook strength sub-score with explanation | UNIT-02 |
| S-14 | User sees pacing sub-score (video only) | UNIT-02 |
| S-15 | User sees visual appeal sub-score | UNIT-02 |
| S-16 | User sees caption optimization sub-score | UNIT-02 |
| S-17 | User sees platform fit sub-score | UNIT-02 |
| S-18 | User sees 10–15 hashtag recommendations | UNIT-02 |
| S-19 | User sees audio style suggestion | UNIT-02 |
| S-20 | User sees 1–3 actionable suggestions per dimension | UNIT-02 |
| S-21 | User views analysis history (last 20) on dashboard | UNIT-02 |
| S-22 | User clicks past analysis to view full report | UNIT-02 |
| S-23 | User is blocked from accessing another user's analysis | UNIT-02 |
| S-24 | User is rate-limited after 5 analyses/hour | UNIT-01 + UNIT-02 |

## NFR Story → Unit Mapping

| NFR Story | Description | Unit |
|---|---|---|
| N-01 | All API routes validate JWT server-side | UNIT-01 |
| N-02 | HTTP security headers on all responses | UNIT-01 |
| N-03 | File type + size validation before upload | UNIT-01 |
| N-04 | Supabase RLS enforces data ownership | UNIT-01 |
| N-05 | API keys in env vars, never in source | UNIT-01 |
| N-06 | Rate limiting on /api/analyze and /api/upload | UNIT-01 |
| N-07 | Structured logging with correlation IDs | UNIT-01 + UNIT-02 |
| N-08 | Generic error messages to users (no stack traces) | UNIT-01 + UNIT-02 |
| N-09 | Score normalization PBT (invariant: [0,100]) | UNIT-02 |
| N-10 | AI response parsing round-trip PBT | UNIT-02 |
| N-11 | WCAG 2.1 AA — keyboard nav, ARIA labels | UNIT-01 + UNIT-02 |
| N-12 | Mobile-responsive layout | UNIT-01 + UNIT-02 |

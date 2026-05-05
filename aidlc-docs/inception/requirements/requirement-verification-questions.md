# Requirements Clarification Questions — Go Viral Clone

Please answer each question by filling in the letter choice after the `[Answer]:` tag.
If none of the options match your needs, choose the last option (Other) and describe your preference.
Let me know when you're done.

---

## Question 1
What type of application should this be?

A) Web application only (browser-based, React/Next.js frontend)
B) Mobile application only (React Native or Flutter)
C) Both web and mobile (shared backend, separate frontends)
D) Progressive Web App (PWA — works on both web and mobile from one codebase)
E) Other (please describe after [Answer]: tag below)

[Answer]: web app only that too for totally free

---

## Question 2
Which AI provider(s) should be used for content analysis?

A) Google Gemini API only
B) Groq API only (fast inference with Llama/Mixtral models)
C) Both Gemini and Groq (Gemini for vision/video, Groq for text speed)
D) OpenAI API (GPT-4o with vision)
E) Other (please describe after [Answer]: tag below)

[Answer]: any apis multiple too but the only constraint is totally should be free

---

## Question 3
What content types should the app support for upload and analysis?

A) Video only (MP4, MOV, etc.)
B) Images only (JPG, PNG, GIF, etc.)
C) Video + Images + Text captions (all three)
D) Video + Images only (no standalone caption analysis)
E) Other (please describe after [Answer]: tag below)

[Answer]: which ever is easy and free but it should effecient + effective for this

---

## Question 4
Should the app require user authentication / accounts?

A) Yes — full auth with accounts (users can save history, track scores over time)
B) Yes — simple auth (Google/social login only, minimal profile)
C) No — anonymous/guest usage only (no accounts, no history saved)
D) Optional — allow both guest and registered users
E) Other (please describe after [Answer]: tag below)

[Answer]: for now yes lets use supabase for it maybe or convex db anything is fine.

---

## Question 5
How should the virality score breakdown be presented?

A) Single overall score (0-100) with a brief text explanation
B) Overall score + sub-scores per category (hook, pacing, thumbnail, caption, audio)
C) Overall score + sub-scores + detailed actionable suggestions per category
D) Full dashboard: scores + suggestions + competitor comparison + trending recommendations
E) Other (please describe after [Answer]: tag below)

[Answer]: effective + efficient

---

## Question 6
What should the "Competitor Content Comparison" feature do?

A) Compare uploaded content against a curated database of viral content benchmarks
B) Let users manually input a competitor URL (TikTok/Instagram/YouTube) to compare against
C) Show trending content in the same niche/category as a reference
D) Skip this feature for the initial version
E) Other (please describe after [Answer]: tag below)

[Answer]: skip this feature for the initial version

---

## Question 7
How should "Trending Audio/Hashtag Recommendations" work?

A) AI-generated suggestions based on content analysis (no external API needed)
B) Pull real-time trending data from a third-party API (e.g., TikTok API, RapidAPI)
C) Curated static list of trending hashtags/audio updated periodically
D) Skip this feature for the initial version
E) Other (please describe after [Answer]: tag below)

[Answer]: option b but it should be totally free

---

## Question 8
What is the target social media platform focus?

A) TikTok-first (short-form vertical video, 15s–3min)
B) Instagram-first (Reels, Stories, Posts)
C) YouTube-first (long-form + Shorts)
D) Platform-agnostic (works for any platform, user selects target platform)
E) Other (please describe after [Answer]: tag below)

[Answer]: all of the above no long form for now lets limit it to like 5 to 7 mins max 

---

## Question 9
What is the expected deployment/hosting environment?

A) Vercel / Netlify (frontend) + serverless backend (e.g., Vercel Functions, AWS Lambda)
B) Traditional cloud VM/container (AWS EC2, GCP, Azure)
C) Docker container (self-hosted or cloud)
D) No preference — choose what fits best
E) Other (please describe after [Answer]: tag below)

[Answer]: vercel + supabase

---

## Question 10
What is the tech stack preference for the backend?

A) Node.js / TypeScript (Express or Fastify)
B) Python (FastAPI or Flask) — good for AI/ML integrations
C) Go (Golang) — high performance
D) No preference — choose what fits best with the AI APIs
E) Other (please describe after [Answer]: tag below)

[Answer]: option A

---

## Question 11
What is the maximum video file size / duration that should be supported?

A) Small: up to 50MB / 60 seconds (TikTok-style short clips)
B) Medium: up to 200MB / 5 minutes (Reels/Shorts range)
C) Large: up to 500MB / 15 minutes (YouTube Shorts + longer content)
D) No strict limit — handle whatever the AI API supports
E) Other (please describe after [Answer]: tag below)

[Answer]: like based on the capabilities of our build

---

## Question 12
Should the app include a "re-analysis" or "edit and re-score" workflow?

A) Yes — users can edit their caption/title and get a new score without re-uploading
B) Yes — users can re-upload an edited version and compare scores side-by-side
C) No — single analysis per upload, no comparison
D) Both A and B
E) Other (please describe after [Answer]: tag below)

[Answer]: for now option c but for future implementations we can add option B alone

---

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: Option A

---

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers)
X) Other (please describe after [Answer]: tag below)

[Answer]: option B

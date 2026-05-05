# Tech Stack Decisions — UNIT-02: AI Engine

| Concern | Decision | Version | Rationale |
|---|---|---|---|
| AI Vision/Video | @google/generative-ai | 0.x | Gemini 1.5 Flash — free tier, multimodal |
| AI Text Speed | groq-sdk | 0.x | Groq free tier, fast Llama 3.1 70B |
| DB Client | @supabase/supabase-js | 2.x | Already in UNIT-01 |
| Score Validation | Zod | 3.x | Already in UNIT-01 |
| PBT | fast-check | 3.x | TypeScript PBT, Vitest integration |
| Animation | framer-motion | 11.x | Score gauge + loading animations |
| Icons | lucide-react | latest | Consistent icon set, tree-shakeable |

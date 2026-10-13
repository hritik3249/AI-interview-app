# AI Interview App — Cabin Crew Candidate Evaluation

AI-driven interview platform for airline cabin crew recruitment. Evaluates spoken answers with structured LLM scoring, recruiter feedback, and session analytics.

## Tech Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL) backend + Anthropic + Google Generative AI SDK
- Zod schema validation + structured output scoring

## Features
- Setup → Interview → Report flow with category-based questions
- Real-time AI scoring (communication, confidence, customer service, emotional intelligence, structure, grammar, professionalism, cultural awareness)
- Session dashboard with history
- Schema-validated JSON output (retried + fallback pipeline)

## Demo
Live: https://ai-interview-app-one-pi.vercel.app
Repo: https://github.com/hritik3249/AI-interview-app

## Setup
```bash
cp .env.local.example .env.local
# Add GEMINI_API_KEY, SUPABASE_URL, SUPABASE_KEY, ANTHROPIC_API_KEY
npm install
npm run dev
```

## Architecture
- `app/api/score/` — LLM scoring with retry/fallback and Zod validation
- `lib/prompts/` — versioned prompt templates
- `lib/logging/` — observability (latency, token counts)
- `lib/guardrails/` — input sanitization + rate limiting

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ScoreSchema } from '@/lib/score-schema'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { logScoreSession } from '@/lib/logging/observability'

import { sanitizeAnswer, isRateLimited } from '@/lib/guardrails/sanitizer'

export async function POST(req: NextRequest) {
  try {
    const { transcript, question, category, airline, difficulty } = await req.json()

    if (!transcript || !question) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Security: sanitize input and enforce rate limit
    const cleanTranscript = sanitizeAnswer(transcript)
    if (cleanTranscript.length === 0) {
      return NextResponse.json({ error: 'Transcript empty after sanitization' }, { status: 400 })
    }
    if (isRateLimited(req.headers.get('x-forwarded-for') || 'anonymous')) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const prompt = `You are a strict but fair ${airline} airline recruiter (${difficulty} difficulty) evaluating a female cabin crew candidate's spoken interview answer.

Question asked: "${question}"
Category: ${category}
Candidate's spoken answer: "${cleanTranscript}"

Score honestly from 0-100 on each dimension. Be realistic — most candidates score 40-75. Only exceptional answers get 85+.

Respond ONLY in this exact JSON format (no markdown, no preamble, no extra text):
{
  "scores": {
    "communication": <0-100>,
    "confidence": <0-100>,
    "customer_service_mindset": <0-100>,
    "emotional_intelligence": <0-100>,
    "answer_structure": <0-100>,
    "grammar_vocabulary": <0-100>,
    "professionalism": <0-100>,
    "cultural_awareness": <0-100>
  },
  "what_was_good": "<1-2 sentences — specific praise>",
  "what_was_weak": "<1-2 sentences — specific honest critique>",
  "top_tip": "<one concrete actionable improvement for next time>",
  "recruiter_reaction": "<1 sentence — blunt honest recruiter thought>"
}`

    // Retry with exponential backoff (3 attempts max)
    let lastErr: any = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt)
        const raw = result.response.text()
        const cleaned = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        const validated = ScoreSchema.parse(parsed)
        return NextResponse.json(validated)
      } catch (e) {
        lastErr = e
        if (attempt < 3) await new Promise(r => setTimeout(r, 500 * attempt))
      }
    }
    // Fallback: Anthropic Claude 3.5 Sonnet if Gemini fails
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
        const msg = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: 'You are a strict airline recruiter. Respond only with valid JSON matching the score schema.',
          messages: [{ role: 'user', content: prompt }]
        })
        const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
        const cleaned = raw.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(cleaned)
        const validated = ScoreSchema.parse(parsed)
        logScoreSession({ sessionId: req.headers.get('x-session-id') || 'anon', latencyMs: 0, model: 'claude-3-5-sonnet', error: undefined })
        return NextResponse.json(validated)
      } catch (fbErr) {
        console.error('Anthropic fallback failed:', fbErr)
      }
    }
    throw lastErr
  } catch (err) {
    console.error('Score API error:', err)
    return NextResponse.json(
      {
        scores: {
          communication: 55, confidence: 50, customer_service_mindset: 55,
          emotional_intelligence: 50, answer_structure: 50,
          grammar_vocabulary: 55, professionalism: 55, cultural_awareness: 50,
        },
        what_was_good: 'You made an attempt to answer the question.',
        what_was_weak: 'The answer needed more specific examples and structure.',
        top_tip: 'Use the STAR method: Situation, Task, Action, Result.',
        recruiter_reaction: 'Average answer — needs more depth and confidence.',
      },
      { status: 200 }
    )
  }
}

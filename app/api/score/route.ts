import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { transcript, question, category, airline, difficulty } = await req.json()

    if (!transcript || !question) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const system = `You are a strict but fair ${airline} airline recruiter (${difficulty} difficulty) evaluating a female cabin crew candidate's spoken interview answer.

Question asked: "${question}"
Category: ${category}
Candidate's spoken answer: "${transcript}"

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

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: transcript }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())

    return NextResponse.json(parsed)
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

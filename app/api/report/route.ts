import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { overall, topAreas, weakAreas, airline, questionsAnswered } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 250,
      messages: [
        {
          role: 'user',
          content: `You are a ${airline} recruitment head. A female cabin crew candidate completed a voice interview.
Overall score: ${overall}/100. Answered ${questionsAnswered} questions.
Strongest areas: ${topAreas}.
Weakest areas: ${weakAreas}.

Write exactly 3 sentences:
1. What genuinely impressed you about this candidate.
2. The single most important area she must work on.
3. Whether you would advance her to the next round and why.

Be direct, professional, and honest. Do not use bullet points.`,
        },
      ],
    })

    const text = (message.content[0] as { type: string; text: string }).text
    return NextResponse.json({ note: text })
  } catch (err) {
    console.error('Report API error:', err)
    return NextResponse.json({
      note: 'Interview complete. Review your detailed scores above and focus on your weakest areas before your next practice session.',
    })
  }
}

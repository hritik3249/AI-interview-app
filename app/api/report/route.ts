import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const { overall, topAreas, weakAreas, airline, questionsAnswered } = await req.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a ${airline} recruitment head. A female cabin crew candidate completed a voice interview.
Overall score: ${overall}/100. Answered ${questionsAnswered} questions.
Strongest areas: ${topAreas}.
Weakest areas: ${weakAreas}.

Write exactly 3 sentences:
1. What genuinely impressed you about this candidate.
2. The single most important area she must work on.
3. Whether you would advance her to the next round and why.

Be direct, professional, and honest. Do not use bullet points.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    return NextResponse.json({ note: text })
  } catch (err) {
    console.error('Report API error:', err)
    return NextResponse.json({
      note: 'Interview complete. Review your detailed scores above and focus on your weakest areas before your next practice session.',
    })
  }
}

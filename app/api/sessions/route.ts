import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const body = await req.json()

    const { data, error } = await supabase
      .from('interview_sessions')
      .insert([{
        user_id: body.user_id || 'anonymous',
        mode: body.mode,
        airline: body.airline,
        difficulty: body.difficulty,
        overall_score: body.overall_score,
        selection_probability: body.selection_probability,
        readiness_level: body.readiness_level,
        scores_breakdown: body.scores_breakdown,
        recruiter_note: body.recruiter_note,
        questions_answered: body.questions_answered,
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase save error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session: data })
  } catch (err) {
    console.error('Save session error:', err)
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id') || 'anonymous'

    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ sessions: data })
  } catch (err) {
    console.error('Get sessions error:', err)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

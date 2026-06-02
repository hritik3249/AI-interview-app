'use client'
import { useEffect, useState } from 'react'
import { MODE_LABELS } from '@/lib/questions'

type Session = {
  id: string
  mode: string
  airline: string
  difficulty: string
  overall_score: number
  selection_probability: number
  readiness_level: string
  scores_breakdown: Record<string, number>
  questions_answered: number
  created_at: string
}

type Props = {
  userId: string
  onBack: () => void
}

function scoreColor(v: number) {
  if (v >= 70) return '#1D9E75'
  if (v >= 50) return '#BA7517'
  return '#D85A30'
}

export default function DashboardScreen({ userId, onBack }: Props) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/sessions?user_id=${userId}`)
      .then(r => r.json())
      .then(d => { setSessions(d.sessions || []); setLoading(false) })
      .catch(() => { setError('Could not load history'); setLoading(false) })
  }, [userId])

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((s, r) => s + r.overall_score, 0) / sessions.length)
    : 0

  const bestScore = sessions.length ? Math.max(...sessions.map(s => s.overall_score)) : 0

  const trend = sessions.length >= 2
    ? sessions[0].overall_score - sessions[sessions.length - 1].overall_score
    : 0

  return (
    <div className="flex flex-col gap-5 px-5 py-6 max-w-lg mx-auto">

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 w-fit">
        ← Back
      </button>

      <div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl">Progress Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Your interview history and improvement trends</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] dot-bounce" />
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] dot-bounce" />
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] dot-bounce" />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-[#FAECE7] border border-[#F0997B] rounded-xl p-4 text-sm text-[#993C1D]">
          {error}
          <div className="text-xs mt-1 text-[#712B13]">Make sure your Supabase environment variables are configured.</div>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">🎙</div>
          <div className="text-sm font-medium text-gray-700">No interviews yet</div>
          <div className="text-xs text-gray-500 mt-1">Complete your first interview to see stats here</div>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-medium" style={{ color: '#1D9E75' }}>{sessions.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">Sessions</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-medium" style={{ color: scoreColor(avgScore) }}>{avgScore}</div>
              <div className="text-xs text-gray-500 mt-0.5">Avg score</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-medium" style={{ color: scoreColor(bestScore) }}>{bestScore}</div>
              <div className="text-xs text-gray-500 mt-0.5">Best score</div>
            </div>
          </div>

          {trend !== 0 && (
            <div className={`text-sm text-center rounded-xl py-2 px-4 ${trend > 0 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FAEEDA] text-[#BA7517]'}`}>
              {trend > 0 ? `📈 Improved by ${trend} points` : `📉 Dropped by ${Math.abs(trend)} points`} since first session
            </div>
          )}

          {/* Current readiness */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <div className="text-sm font-medium mb-1">Current readiness</div>
            <div className="text-lg" style={{ color: '#1D9E75' }}>{sessions[0].readiness_level}</div>
            <div className="text-xs text-gray-500 mt-0.5">Based on your most recent session</div>
          </div>

          {/* Session history */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Recent sessions</div>
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{s.airline}</div>
                      <div className="text-xs text-gray-500">
                        {MODE_LABELS[s.mode as keyof typeof MODE_LABELS] || s.mode} · {s.difficulty}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-medium" style={{ color: scoreColor(s.overall_score) }}>
                        {s.overall_score}
                      </div>
                      <div className="text-[10px] text-gray-400">{s.questions_answered} Qs</div>
                    </div>
                  </div>
                  {/* Mini score bars */}
                  <div className="mt-2 flex gap-1">
                    {Object.values(s.scores_breakdown).slice(0, 8).map((v, i) => (
                      <div key={i} className="flex-1 h-1 bg-gray-100 rounded-full">
                        <div className="h-full rounded-full" style={{ width: `${v}%`, background: scoreColor(v as number) }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

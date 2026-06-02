'use client'
import { ReportData } from './InterviewApp'
import { SCORE_KEYS, SCORE_LABELS, READINESS_LEVELS, MODE_LABELS } from '@/lib/questions'

type Props = {
  report: ReportData
  onHome: () => void
  onRetry: () => void
  onDashboard: () => void
}

function scoreColor(v: number) {
  if (v >= 70) return '#1D9E75'
  if (v >= 50) return '#BA7517'
  return '#D85A30'
}

function scoreBg(v: number) {
  if (v >= 70) return 'bg-[#E1F5EE] text-[#0F6E56]'
  if (v >= 50) return 'bg-[#FAEEDA] text-[#BA7517]'
  return 'bg-[#FAECE7] text-[#993C1D]'
}

export default function ReportScreen({ report, onHome, onRetry, onDashboard }: Props) {
  const readinessIdx = READINESS_LEVELS.findIndex(r => r.label === report.readinessLevel)

  return (
    <div className="flex flex-col gap-4 px-5 py-6 max-w-lg mx-auto">

      <div className="text-center">
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl">
          Your Interview Report
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {report.config.airline} · {MODE_LABELS[report.config.mode]}
        </p>
      </div>

      {/* Big score */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
        <div style={{ fontFamily: "'DM Serif Display', serif", color: '#1D9E75', fontSize: 60, lineHeight: 1 }}>
          {report.overall}
        </div>
        <div className="text-sm text-gray-500 mt-1">overall score out of 100</div>
        <div className={`inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full ${scoreBg(report.overall)}`}>
          {report.readinessLevel}
        </div>
      </div>

      {/* Readiness bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex justify-between mb-2">
          {READINESS_LEVELS.map((r, i) => (
            <div key={r.label} className={`text-[9px] text-center flex-1 ${i === readinessIdx ? 'text-[#1D9E75] font-medium' : 'text-gray-400'}`}>
              {r.label}
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full">
          <div
            className="h-full bg-[#1D9E75] rounded-full transition-all duration-1000"
            style={{ width: `${report.overall}%` }}
          />
        </div>
      </div>

      {/* Score breakdown */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
        <div className="text-sm font-medium">Score breakdown</div>
        {SCORE_KEYS.map(k => {
          const v = report.scores[k]
          return (
            <div key={k} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 flex-1">{SCORE_LABELS[k]}</span>
              <div className="flex-[2] h-1 bg-gray-100 rounded-full">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${v}%`, background: scoreColor(v) }}
                />
              </div>
              <span className="text-xs font-medium min-w-[28px] text-right" style={{ color: scoreColor(v) }}>
                {v}
              </span>
            </div>
          )
        })}
      </div>

      {/* Selection probability */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
        <div className="text-3xl font-medium" style={{ color: scoreColor(report.selectionProb) }}>
          {report.selectionProb}%
        </div>
        <div className="text-xs text-gray-500 mt-1">
          estimated selection probability · {report.config.airline}
        </div>
      </div>

      {/* Recruiter note */}
      <div className="bg-[#E1F5EE] border-l-2 border-[#1D9E75] px-4 py-3 text-sm text-[#085041] leading-relaxed">
        <div className="text-[10px] font-medium text-[#0F6E56] mb-1">RECRUITER NOTE</div>
        {report.recruiterNote}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={onHome} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300 transition-colors">
          🏠 Home
        </button>
        <button onClick={onDashboard} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-gray-300 transition-colors">
          📊 Dashboard
        </button>
        <button onClick={onRetry} className="flex-1 py-3 bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-xl text-sm font-medium transition-colors">
          🔄 Retry
        </button>
      </div>

      {report.sessionId && (
        <p className="text-center text-xs text-gray-400">Session saved to your history ✓</p>
      )}
    </div>
  )
}

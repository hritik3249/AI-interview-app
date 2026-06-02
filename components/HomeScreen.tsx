'use client'
import { Mode } from '@/lib/questions'

type Props = {
  onStart: (mode: Mode) => void
  onDashboard: () => void
}

const MODES = [
  { id: 'indigo' as Mode, label: 'IndiGo Assessment', desc: 'Real questions from IndiGo online rounds', hot: true, icon: '✈' },
  { id: 'full' as Mode, label: 'Full HR Interview', desc: '10-question complete round with follow-ups', icon: '👥' },
  { id: 'rapid' as Mode, label: 'Rapid Fire Round', desc: '5 quick questions, build confidence fast', icon: '⚡' },
  { id: 'customer' as Mode, label: 'Customer Service', desc: 'Handle passengers, conflict, emergencies', icon: '🤝' },
]

export default function HomeScreen({ onStart, onDashboard }: Props) {
  return (
    <div className="flex flex-col items-center px-5 py-8 gap-6 max-w-lg mx-auto">

      {/* Logo */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm text-gray-500">
        <div className="w-6 h-6 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-xs">✈</div>
        CabinCrewAI · Voice Edition
      </div>

      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl leading-tight">
          Your AI recruiter<br />
          <em style={{ color: '#1D9E75', fontStyle: 'italic' }}>listens &amp; scores</em><br />
          your answers.
        </h1>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
          Speak your answers just like a real airline interview. The recruiter asks, you speak, AI scores instantly.
        </p>
      </div>

      {/* Mode grid */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onStart(m.id)}
            className={`bg-white rounded-2xl p-4 text-left border transition-all hover:-translate-y-0.5 hover:border-[#1D9E75] active:scale-98 ${
              m.hot ? 'border-[#1D9E75]' : 'border-gray-200'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center text-base mb-2">
              {m.icon}
            </div>
            {m.hot && (
              <span className="text-[10px] bg-[#E1F5EE] text-[#0F6E56] font-medium px-2 py-0.5 rounded-full block w-fit mb-1">
                Most asked
              </span>
            )}
            <div className="text-sm font-medium text-gray-900">{m.label}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* Dashboard link */}
      <button
        onClick={onDashboard}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <span>📊</span> View my progress dashboard
      </button>

      {/* Browser tip */}
      <p className="text-xs text-gray-400 text-center">
        Works best on Chrome or Edge · Allow microphone when prompted
      </p>
    </div>
  )
}

'use client'
import { InterviewConfig } from './InterviewApp'
import { AIRLINES, MODE_LABELS, Mode } from '@/lib/questions'

type Props = {
  config: InterviewConfig
  onChange: (c: InterviewConfig) => void
  onBack: () => void
  onBegin: () => void
}

const DIFFS = ['Beginner', 'Intermediate', 'Tough']

export default function SetupScreen({ config, onChange, onBack, onBegin }: Props) {
  return (
    <div className="flex flex-col gap-5 px-5 py-6 max-w-lg mx-auto">

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 w-fit">
        ← Back
      </button>

      <div>
        <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl">
          {MODE_LABELS[config.mode]}
        </h2>
        <p className="text-sm text-gray-500 mt-1">Choose your airline and difficulty, then speak your answers.</p>
      </div>

      {/* Airline */}
      <div>
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Airline</div>
        <div className="grid grid-cols-3 gap-2">
          {AIRLINES.map((a) => (
            <button
              key={a}
              onClick={() => onChange({ ...config, airline: a })}
              className={`border rounded-lg py-2 px-1 text-xs text-center transition-all ${
                config.airline === a
                  ? 'border-[#1D9E75] bg-[#E1F5EE] text-[#0F6E56] font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              ✈ {a}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Difficulty</div>
        <div className="flex gap-2">
          {DIFFS.map((d) => (
            <button
              key={d}
              onClick={() => onChange({ ...config, difficulty: d })}
              className={`flex-1 border rounded-lg py-2 text-sm transition-all ${
                config.difficulty === d
                  ? 'border-[#1D9E75] bg-[#E1F5EE] text-[#0F6E56] font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* What to expect */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
        <div className="text-sm font-medium">What to expect</div>
        <ul className="text-sm text-gray-500 space-y-1.5">
          <li className="flex items-start gap-2"><span className="text-[#1D9E75]">🎙</span> Recruiter speaks each question aloud</li>
          <li className="flex items-start gap-2"><span className="text-[#1D9E75]">🗣</span> You tap the mic and speak your answer</li>
          <li className="flex items-start gap-2"><span className="text-[#1D9E75]">📊</span> AI scores you after each answer</li>
          <li className="flex items-start gap-2"><span className="text-[#1D9E75]">📋</span> Full recruiter report at the end</li>
        </ul>
      </div>

      <button
        onClick={onBegin}
        className="w-full py-3 bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-xl text-sm font-medium transition-colors"
      >
        🎙 Start Voice Interview
      </button>
    </div>
  )
}

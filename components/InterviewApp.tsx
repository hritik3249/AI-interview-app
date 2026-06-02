'use client'
import { useState } from 'react'
import HomeScreen from './HomeScreen'
import SetupScreen from './SetupScreen'
import InterviewScreen from './InterviewScreen'
import ReportScreen from './ReportScreen'
import DashboardScreen from './DashboardScreen'
import { Mode } from '@/lib/questions'

export type Screen = 'home' | 'setup' | 'interview' | 'report' | 'dashboard'

export type InterviewConfig = {
  mode: Mode
  airline: string
  difficulty: string
}

export type ScoreData = {
  communication: number
  confidence: number
  customer_service_mindset: number
  emotional_intelligence: number
  answer_structure: number
  grammar_vocabulary: number
  professionalism: number
  cultural_awareness: number
}

export type ReportData = {
  overall: number
  scores: ScoreData
  recruiterNote: string
  selectionProb: number
  readinessLevel: string
  config: InterviewConfig
  questionsAnswered: number
  sessionId?: string
}

export default function InterviewApp() {
  const [screen, setScreen] = useState<Screen>('home')
  const [config, setConfig] = useState<InterviewConfig>({ mode: 'indigo', airline: 'IndiGo', difficulty: 'Beginner' })
  const [report, setReport] = useState<ReportData | null>(null)
  const [userId] = useState(() => {
    if (typeof window === 'undefined') return 'anonymous'
    let id = localStorage.getItem('cabincrew_uid')
    if (!id) { id = 'user_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('cabincrew_uid', id) }
    return id
  })

  return (
    <div className="min-h-screen bg-[#f5f5f3]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {screen === 'home' && (
        <HomeScreen
          onStart={(mode) => { setConfig(c => ({ ...c, mode })); setScreen('setup') }}
          onDashboard={() => setScreen('dashboard')}
        />
      )}
      {screen === 'setup' && (
        <SetupScreen
          config={config}
          onChange={setConfig}
          onBack={() => setScreen('home')}
          onBegin={() => setScreen('interview')}
        />
      )}
      {screen === 'interview' && (
        <InterviewScreen
          config={config}
          userId={userId}
          onComplete={(r) => { setReport(r); setScreen('report') }}
          onBack={() => setScreen('setup')}
        />
      )}
      {screen === 'report' && report && (
        <ReportScreen
          report={report}
          onHome={() => setScreen('home')}
          onRetry={() => setScreen('interview')}
          onDashboard={() => setScreen('dashboard')}
        />
      )}
      {screen === 'dashboard' && (
        <DashboardScreen
          userId={userId}
          onBack={() => setScreen('home')}
        />
      )}
    </div>
  )
}

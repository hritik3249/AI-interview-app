'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { InterviewConfig, ReportData, ScoreData } from './InterviewApp'
import {
  QUESTION_BANKS, SCORE_KEYS, SCORE_LABELS, SCORE_WEIGHTS,
  calcAverageScores, calcOverallScore, getReadinessLevel, SKIP_SCORES
} from '@/lib/questions'

type Props = {
  config: InterviewConfig
  userId: string
  onComplete: (r: ReportData) => void
  onBack: () => void
}

type FeedbackItem = {
  score: number
  what_was_good: string
  what_was_weak: string
  top_tip: string
}

type MicState = 'idle' | 'recording' | 'processing'

export default function InterviewScreen({ config, userId, onComplete, onBack }: Props) {
  const bank = QUESTION_BANKS[config.mode]
  const total = bank.length

  const [qIdx, setQIdx] = useState(0)
  const [micState, setMicState] = useState<MicState>('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState<FeedbackItem | null>(null)
  const [status, setStatus] = useState('Recruiter is speaking...')
  const [allScores, setAllScores] = useState<ScoreData[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
      // Pre-load voices
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
    return () => {
      synthRef.current?.cancel()
      recognitionRef.current?.stop()
    }
  }, [])

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    const synth = synthRef.current
    if (!synth) { onEnd?.(); return }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.92
    u.pitch = 1.0
    u.volume = 1
    const voices = synth.getVoices()
    const female = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
       v.name.toLowerCase().includes('samantha') ||
       v.name.toLowerCase().includes('karen') ||
       v.name.toLowerCase().includes('zira') ||
       v.name.toLowerCase().includes('victoria') ||
       v.name.toLowerCase().includes('moira'))
    )
    if (female) u.voice = female
    u.onend = () => { setIsSpeaking(false); onEnd?.() }
    u.onerror = () => { setIsSpeaking(false); onEnd?.() }
    setIsSpeaking(true)
    synth.speak(u)
  }, [])

  const askQuestion = useCallback((idx: number) => {
    const item = bank[idx]
    setFeedback(null)
    setTranscript('')
    finalTranscriptRef.current = ''
    setMicState('idle')
    setStatus('Recruiter is speaking...')

    speakText(item.q, () => {
      setStatus('Tap the mic and speak your answer')
    })
  }, [bank, speakText])

  useEffect(() => {
    askQuestion(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startRecording = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      alert('Voice recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-IN'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscriptRef.current += e.results[i][0].transcript + ' '
        else interim += e.results[i][0].transcript
      }
      setTranscript((finalTranscriptRef.current + interim).trim())
    }

    r.onerror = () => stopRecording()
    r.onend = () => { if (micState === 'recording') stopRecording() }
    r.start()
    recognitionRef.current = r
    setMicState('recording')
    setStatus('Recording... tap mic again to stop')
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setMicState('idle')
    const words = finalTranscriptRef.current.trim().split(/\s+/).filter(Boolean).length
    setStatus(words > 3 ? 'Answer captured — submit or re-record' : 'Tap the mic and speak your answer')
  }

  const toggleMic = () => {
    if (micState === 'processing' || isSpeaking || isTransitioning) return
    if (micState === 'recording') stopRecording()
    else startRecording()
  }

  const submitAnswer = async () => {
    const ans = finalTranscriptRef.current.trim()
    if (!ans || micState === 'processing') return
    if (micState === 'recording') stopRecording()
    synthRef.current?.cancel()

    setMicState('processing')
    setStatus('AI is evaluating your answer...')

    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: ans,
          question: bank[qIdx].q,
          category: bank[qIdx].cat,
          airline: config.airline,
          difficulty: config.difficulty,
        }),
      })
      const data = await res.json()
      const avg = Math.round(Object.values(data.scores as ScoreData).reduce((a: number, b: number) => a + b, 0) / 8)

      setFeedback({ score: avg, what_was_good: data.what_was_good, what_was_weak: data.what_was_weak, top_tip: data.top_tip })
      setAllScores(prev => [...prev, data.scores])
      setStatus('Feedback ready — next question coming soon...')

      // Speak the tip
      speakText('Tip: ' + data.top_tip)

      // Move to next after delay
      setIsTransitioning(true)
      setTimeout(() => {
        const nextIdx = qIdx + 1
        setIsTransitioning(false)
        if (nextIdx >= total) {
          finishInterview([...allScores, data.scores])
        } else {
          setQIdx(nextIdx)
          askQuestion(nextIdx)
        }
        setMicState('idle')
      }, 4000)

    } catch {
      setMicState('idle')
      setStatus('Network error — try again')
    }
  }

  const skipQuestion = () => {
    if (isTransitioning) return
    synthRef.current?.cancel()
    if (micState === 'recording') stopRecording()
    const newScores = [...allScores, SKIP_SCORES as ScoreData]
    setAllScores(newScores)
    const nextIdx = qIdx + 1
    if (nextIdx >= total) {
      finishInterview(newScores)
    } else {
      setQIdx(nextIdx)
      setFeedback(null)
      setTranscript('')
      finalTranscriptRef.current = ''
      setMicState('idle')
      askQuestion(nextIdx)
    }
  }

  const finishInterview = async (finalScores: ScoreData[]) => {
    if (!finalScores.length) return
    synthRef.current?.cancel()
    setMicState('processing')
    setStatus('Generating your report...')

    const avgScores = calcAverageScores(finalScores)
    const overall = calcOverallScore(avgScores)
    const readinessLevel = getReadinessLevel(overall)
    const selectionProb = Math.min(95, Math.max(5, Math.round(overall * 0.8 + (Math.random() * 8 - 4))))

    const sorted = SCORE_KEYS.slice().sort((a, b) => avgScores[b] - avgScores[a])
    const topAreas = sorted.slice(0, 2).map(k => SCORE_LABELS[k]).join(', ')
    const weakAreas = sorted.slice(-2).map(k => SCORE_LABELS[k]).join(', ')

    let recruiterNote = 'Interview complete. Review your scores and keep practising!'

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overall, topAreas, weakAreas, airline: config.airline, questionsAnswered: finalScores.length }),
      })
      const d = await res.json()
      recruiterNote = d.note || recruiterNote
    } catch { /* use default */ }

    // Save to Supabase
    let sessionId: string | undefined
    try {
      const saveRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          mode: config.mode,
          airline: config.airline,
          difficulty: config.difficulty,
          overall_score: overall,
          selection_probability: selectionProb,
          readiness_level: readinessLevel,
          scores_breakdown: avgScores,
          recruiter_note: recruiterNote,
          questions_answered: finalScores.length,
        }),
      })
      const saved = await saveRes.json()
      sessionId = saved.session?.id
    } catch { /* continue without saving */ }

    onComplete({
      overall,
      scores: avgScores,
      recruiterNote,
      selectionProb,
      readinessLevel,
      config,
      questionsAnswered: finalScores.length,
      sessionId,
    })
  }

  const progress = Math.round((qIdx / total) * 100)
  const hasAnswer = transcript.split(/\s+/).filter(Boolean).length > 3
  const item = bank[qIdx]

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-700 text-sm">←</button>
        <span className="text-xs font-medium bg-[#E1F5EE] text-[#0F6E56] px-2.5 py-0.5 rounded-full">
          {config.airline}
        </span>
        <div className="flex-1 h-1 bg-gray-100 rounded-full">
          <div
            className="h-full bg-[#1D9E75] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">Q {qIdx + 1}/{total}</span>
      </div>

      {/* Main voice stage */}
      <div className="flex flex-col items-center gap-5 px-5 py-6 flex-1">

        {/* Recruiter avatar */}
        <div className="relative">
          {isSpeaking && (
            <div className="absolute inset-[-8px] rounded-full border-2 border-[#1D9E75] pulse-ring" />
          )}
          <div className="w-20 h-20 rounded-full bg-[#E1F5EE] border-2 border-[#1D9E75] flex items-center justify-center text-3xl">
            👩‍✈️
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 w-full">
          <span className="text-[10px] font-medium bg-[#FAEEDA] text-[#BA7517] px-2 py-0.5 rounded-full">
            {item.cat}
          </span>
          <p className="mt-2.5 text-[15px] leading-relaxed text-gray-900">{item.q}</p>
        </div>

        {/* Status */}
        <p className="text-sm text-gray-500 font-medium">{status}</p>

        {/* Waveform (shown while recording) */}
        {micState === 'recording' && (
          <div className="flex items-center gap-1 h-8">
            {[1,2,3,4,5].map(i => (
              <div
                key={i}
                className="w-1 rounded-full bg-[#D85A30] wave-bar"
                style={{ height: '4px' }}
              />
            ))}
          </div>
        )}

        {/* Processing dots */}
        {micState === 'processing' && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] dot-bounce" />
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] dot-bounce" />
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] dot-bounce" />
          </div>
        )}

        {/* Mic button */}
        <button
          onClick={toggleMic}
          disabled={micState === 'processing' || isSpeaking || isTransitioning}
          aria-label="Toggle microphone"
          className={`relative w-18 h-18 rounded-full flex items-center justify-center text-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            micState === 'recording'
              ? 'bg-[#FAECE7] scale-110'
              : 'bg-[#E1F5EE] hover:scale-105'
          }`}
          style={{ width: 72, height: 72 }}
        >
          {micState === 'recording' && (
            <div className="absolute inset-0 rounded-full border-2 border-[#D85A30] mic-ripple" />
          )}
          <span>{micState === 'recording' ? '⏹' : '🎙'}</span>
        </button>

        {/* Transcript */}
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[64px]">
          {transcript ? (
            <p className="text-sm text-gray-800 leading-relaxed">{transcript}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Your spoken answer will appear here...</p>
          )}
        </div>

        {/* Feedback strip */}
        {feedback && (
          <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 space-y-3 slide-up">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Recruiter feedback</span>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                feedback.score >= 70 ? 'bg-[#E1F5EE] text-[#0F6E56]' :
                feedback.score >= 50 ? 'bg-[#FAEEDA] text-[#BA7517]' :
                'bg-[#FAECE7] text-[#993C1D]'
              }`}>
                {feedback.score}/100
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-medium text-[#1D9E75] mb-1">What worked</p>
                <p className="text-xs text-gray-600 leading-relaxed">{feedback.what_was_good}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#D85A30] mb-1">What was weak</p>
                <p className="text-xs text-gray-600 leading-relaxed">{feedback.what_was_weak}</p>
              </div>
            </div>
            <div className="bg-[#E1F5EE] rounded-lg px-3 py-2 text-xs text-[#085041] leading-relaxed border-l-2 border-[#1D9E75]">
              💡 {feedback.top_tip}
            </div>
          </div>
        )}

        {/* Actions */}
        {micState !== 'processing' && !isTransitioning && (
          <div className="flex gap-3 w-full">
            <button
              onClick={skipQuestion}
              className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={submitAnswer}
              disabled={!hasAnswer || micState === 'recording'}
              className="flex-1 py-2.5 bg-[#1D9E75] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-sm font-medium transition-colors hover:bg-[#0F6E56]"
            >
              Submit Answer →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export type QuestionItem = { q: string; cat: string }
export type Mode = 'indigo' | 'full' | 'rapid' | 'customer'

export const QUESTION_BANKS: Record<Mode, QuestionItem[]> = {
  indigo: [
    { q: "What place near your home do you visit more often? What do you usually do there?", cat: "Daily Life" },
    { q: "What phone apps do you use the most, and why?", cat: "Daily Life" },
    { q: "What does your closest family member or friend usually do on weekends?", cat: "Personality" },
    { q: "What mistakes in your life taught you the most important lessons?", cat: "Behavioral" },
    { q: "Describe a situation where you had to make a very quick decision. What happened?", cat: "Situational" },
    { q: "Tell me about a time you tried something completely new. How did that experience go?", cat: "Growth" },
    { q: "Have you ever witnessed a cultural misunderstanding? How was it resolved?", cat: "Cultural Awareness" },
    { q: "How would you politely say no to someone without hurting their feelings?", cat: "Customer Service" },
    { q: "What key ideas did you take from a complex article, video, or book recently?", cat: "Communication" },
    { q: "Apne khali samay ka upyog aap kaise karte hain? Please explain in English.", cat: "Personality" },
  ],
  full: [
    { q: "Please briefly introduce yourself.", cat: "Self Introduction" },
    { q: "How do your friends usually deal with stress? How does that compare to how you handle stress?", cat: "Personality" },
    { q: "Do you learn more from success or from failure? Give me a real example.", cat: "Behavioral" },
    { q: "What is something your community had never experienced before, but you personally experienced?", cat: "Unique Experience" },
    { q: "What is a recent personal win you experienced, big or small?", cat: "Behavioral" },
    { q: "A guest is arriving at your home for the first time. Walk me through exactly how you would welcome them.", cat: "Hospitality" },
    { q: "What is your personal opinion on what success really means?", cat: "Values" },
    { q: "Tell me something about your daily routine.", cat: "Daily Life" },
    { q: "What do you feel at the end of a very busy day?", cat: "Emotional Intelligence" },
    { q: "Tell me about your favourite book and what you took from it.", cat: "Communication" },
  ],
  rapid: [
    { q: "Introduce yourself in about 60 seconds.", cat: "Self Introduction" },
    { q: "Why do you want to become a cabin crew member?", cat: "Motivation" },
    { q: "Name one quality that makes you ideal for this role.", cat: "Self Awareness" },
    { q: "How would you handle a rude passenger mid-flight?", cat: "Customer Service" },
    { q: "Where do you see yourself in three years in aviation?", cat: "Career Vision" },
  ],
  customer: [
    { q: "A passenger is very upset because their meal preference was not available. How do you handle this?", cat: "Customer Service" },
    { q: "A child is crying loudly and the parents seem helpless. What is your first action?", cat: "Situational" },
    { q: "A business class passenger demands an upgrade for a companion — not possible. How do you refuse politely?", cat: "Customer Service" },
    { q: "Two passengers are arguing over overhead bin space. What do you do first?", cat: "Conflict Resolution" },
    { q: "A passenger feels very unwell mid-flight but refuses medical help. How do you approach this?", cat: "Emergency" },
  ],
}

export const SCORE_KEYS = [
  'communication', 'confidence', 'customer_service_mindset',
  'emotional_intelligence', 'answer_structure', 'grammar_vocabulary',
  'professionalism', 'cultural_awareness',
] as const

export type ScoreKey = typeof SCORE_KEYS[number]

export const SCORE_LABELS: Record<ScoreKey, string> = {
  communication: 'Communication',
  confidence: 'Confidence',
  customer_service_mindset: 'Customer Service',
  emotional_intelligence: 'Emotional Intelligence',
  answer_structure: 'Answer Structure',
  grammar_vocabulary: 'Grammar & Vocabulary',
  professionalism: 'Professionalism',
  cultural_awareness: 'Cultural Awareness',
}

export const SCORE_WEIGHTS: Record<ScoreKey, number> = {
  communication: 0.20,
  confidence: 0.15,
  customer_service_mindset: 0.15,
  emotional_intelligence: 0.10,
  answer_structure: 0.10,
  grammar_vocabulary: 0.10,
  professionalism: 0.10,
  cultural_awareness: 0.10,
}

export const AIRLINES = [
  'IndiGo', 'Air India Express', 'Akasa Air',
  'Vistara', 'Emirates', 'Qatar Airways',
]

export const READINESS_LEVELS = [
  { label: 'Beginner', min: 0 },
  { label: 'Developing', min: 40 },
  { label: 'Interview Ready', min: 55 },
  { label: 'Airline Ready', min: 70 },
  { label: 'Top Candidate', min: 85 },
]

export function getReadinessLevel(score: number): string {
  let level = READINESS_LEVELS[0].label
  for (const r of READINESS_LEVELS) {
    if (score >= r.min) level = r.label
  }
  return level
}

export function calcOverallScore(avgScores: Record<ScoreKey, number>): number {
  return Math.round(
    SCORE_KEYS.reduce((sum, k) => sum + avgScores[k] * SCORE_WEIGHTS[k], 0)
  )
}

export function calcAverageScores(allScores: Record<ScoreKey, number>[]): Record<ScoreKey, number> {
  const result = {} as Record<ScoreKey, number>
  for (const k of SCORE_KEYS) {
    result[k] = Math.round(allScores.reduce((s, q) => s + (q[k] ?? 50), 0) / allScores.length)
  }
  return result
}

export const MODE_LABELS: Record<Mode, string> = {
  indigo: 'IndiGo Online Assessment',
  full: 'Full HR Interview',
  rapid: 'Rapid Fire Round',
  customer: 'Customer Service Sim',
}

export const SKIP_SCORES: Record<ScoreKey, number> = {
  communication: 30, confidence: 25, customer_service_mindset: 30,
  emotional_intelligence: 30, answer_structure: 25, grammar_vocabulary: 30,
  professionalism: 25, cultural_awareness: 30,
}

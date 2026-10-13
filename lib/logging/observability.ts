export interface LogEntry {
  sessionId: string
  timestamp: string
  latencyMs: number
  tokensIn?: number
  tokensOut?: number
  model: string
  costEstimate?: number // USD
  error?: string
}

const logs: LogEntry[] = []

export function logScoreSession(entry: Omit<LogEntry, 'timestamp'>) {
  const full = { ...entry, timestamp: new Date().toISOString() }
  logs.push(full)
  console.log('[OBSERVABILITY]', JSON.stringify({ sessionId: full.sessionId, latencyMs: full.latencyMs, model: full.model, error: full.error }))
  return full
}

export async function persistLogToDB(entry: LogEntry) {
  // Placeholder: persist to Supabase interview_sessions or external DB
  // In production, insert into `interview_sessions` with correlation_id = entry.sessionId
  console.log('[PERSIST]', entry.sessionId, entry.latencyMs, entry.model)
  return true
}

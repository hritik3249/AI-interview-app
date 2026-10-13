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

export function getLogs() { return [...logs] }

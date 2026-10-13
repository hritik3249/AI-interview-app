export function sanitizeAnswer(text: string): string {
  // Basic PII/redaction placeholder — strip common patterns
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED-SSN]')
    .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, '[REDACTED-CC]')
    .trim()
}

export function isRateLimited(ip: string, windowMs = 60000, max = 10): boolean {
  // Placeholder rate-limit check (needs Redis/state for production)
  return false
}

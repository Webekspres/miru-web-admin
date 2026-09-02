const JWT_RE = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g
const BEARER_RE = /Bearer\s+\S+/gi
const PASSWORD_JSON_RE = /("password"\s*:\s*")[^"]*(")/gi
const PASSWORD_QUERY_RE = /(password=)[^&\s]*/gi

export function redactSecrets(value: string): string {
  return value
    .replace(JWT_RE, '[redacted]')
    .replace(BEARER_RE, 'Bearer [redacted]')
    .replace(PASSWORD_JSON_RE, '$1[redacted]$2')
    .replace(PASSWORD_QUERY_RE, '$1[redacted]')
}

export function redactLogValue(value: unknown): string {
  if (value instanceof Error) {
    return redactSecrets(`${value.name}: ${value.message}`)
  }
  if (typeof value === 'string') return redactSecrets(value)
  try {
    return redactSecrets(JSON.stringify(value) ?? '')
  } catch {
    return '[unserializable]'
  }
}

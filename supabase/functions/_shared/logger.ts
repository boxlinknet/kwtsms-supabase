// Logging helper with debug/major levels and credential masking
// Related: all Edge Function index.ts files

let debugEnabled = true

export function setDebugLogging(enabled: boolean): void {
  debugEnabled = enabled
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return '***'
  return phone.slice(0, 3) + '****' + phone.slice(-3)
}

export function maskCredential(value: string): string {
  return '***'
}

// Always logged (major actions)
export function log(context: string, message: string, data?: Record<string, unknown>): void {
  const entry = { ts: new Date().toISOString(), ctx: context, msg: message, ...sanitize(data) }
  console.log(JSON.stringify(entry))
}

// Only logged when debug_logging = true
export function debug(context: string, message: string, data?: Record<string, unknown>): void {
  if (!debugEnabled) return
  const entry = { ts: new Date().toISOString(), ctx: context, msg: message, level: 'debug', ...sanitize(data) }
  console.log(JSON.stringify(entry))
}

// Always logged
export function error(context: string, message: string, data?: Record<string, unknown>): void {
  const entry = { ts: new Date().toISOString(), ctx: context, msg: message, level: 'error', ...sanitize(data) }
  console.error(JSON.stringify(entry))
}

function sanitize(data?: Record<string, unknown>): Record<string, unknown> {
  if (!data) return {}
  const clean = { ...data }
  const sensitiveKeys = ['password', 'kwtsms_password', 'secret', 'token', 'authorization']
  for (const key of Object.keys(clean)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      clean[key] = '***'
    }
    if (key === 'phone' && typeof clean[key] === 'string') {
      clean[key] = maskPhone(clean[key] as string)
    }
  }
  return clean
}

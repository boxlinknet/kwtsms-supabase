// Message cleaning: strips emoji, hidden characters, HTML tags
// Related: send-sms/index.ts, sms-auth-hook/index.ts

let cleanMessageFn: ((msg: string) => string) | null = null

try {
  const kwtsms = await import('npm:kwtsms')
  cleanMessageFn = kwtsms.cleanMessage
} catch {
  // kwtsms package not available, use fallback
}

export function cleanMessage(message: string): string {
  if (cleanMessageFn) {
    return cleanMessageFn(message)
  }

  let cleaned = message

  // Strip HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '')

  // Strip emoji (Unicode emoji ranges)
  cleaned = cleaned.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu,
    ''
  )

  // Strip hidden control characters (BOM, zero-width spaces, soft hyphens, directional marks)
  cleaned = cleaned.replace(/[\uFEFF\u200B\u200C\u200D\u200E\u200F\u00AD\u2028\u2029\u202A-\u202E\u2066-\u2069]/g, '')

  // Convert Arabic-Indic digits to Latin (for OTP codes)
  cleaned = cleaned.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

  return cleaned.trim()
}

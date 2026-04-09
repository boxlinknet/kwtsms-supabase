// Unified SMS send pipeline: normalize, validate, coverage check, clean, send
// All SMS sending in the project MUST go through this function
// Related: kwtsms-client.ts, normalize.ts, clean.ts

import { sendSms, type SendResult } from './kwtsms-client.ts'
import { normalizePhone, validatePhone } from './normalize.ts'
import { cleanMessage } from './clean.ts'

export interface SmsSendRequest {
  phone: string
  message: string
  senderId: string
  username: string
  password: string
  testMode: boolean
  defaultCountryCode: string
  coverage: string[] | null
  skipNormalize?: boolean
}

export interface SmsSendResponse {
  ok: boolean
  phone: string
  message: string
  result?: SendResult
  errorCode?: string
  errorMessage?: string
}

export async function processAndSend(req: SmsSendRequest): Promise<SmsSendResponse> {
  // 1. Normalize phone
  const phone = req.skipNormalize
    ? req.phone
    : normalizePhone(req.phone, req.defaultCountryCode)

  if (!phone || phone.length < 8) {
    return { ok: false, phone: phone || '', message: req.message, errorCode: 'INVALID_PHONE', errorMessage: 'Invalid phone number' }
  }

  // 2. Validate phone format
  const validation = validatePhone(phone)
  if (!validation.valid) {
    return { ok: false, phone, message: req.message, errorCode: 'INVALID_PHONE', errorMessage: 'Invalid phone number' }
  }

  // 3. Coverage check
  if (req.coverage && Array.isArray(req.coverage) && req.coverage.length > 0) {
    const hasRoute = req.coverage.some((prefix: string) => phone.startsWith(String(prefix)))
    if (!hasRoute) {
      return { ok: false, phone, message: req.message, errorCode: 'NO_COVERAGE', errorMessage: 'Phone country not supported' }
    }
  }

  // 4. Clean message
  const message = cleanMessage(req.message || '')
  if (!message) {
    return { ok: false, phone, message: '', errorCode: 'EMPTY_MESSAGE', errorMessage: 'Message empty after cleaning' }
  }

  // 5. Send via kwtSMS API
  try {
    const result = await sendSms(req.username, req.password, phone, message, req.senderId, req.testMode)
    if (result.result === 'OK') {
      return { ok: true, phone, message, result }
    }
    return { ok: false, phone, message, result, errorCode: result.code, errorMessage: result.description }
  } catch (err) {
    return { ok: false, phone, message, errorCode: 'API_ERROR', errorMessage: (err as Error).message }
  }
}

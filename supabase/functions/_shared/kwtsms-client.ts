// kwtSMS API wrapper: uses npm:kwtsms package with direct fetch fallback
// Related: send-sms/index.ts, sms-auth-hook/index.ts, sms-cron/index.ts, sms-admin/index.ts

import { ENDPOINTS } from './constants.ts'
import { log, debug, error as logError } from './logger.ts'

interface SendResult {
  result: string
  'msg-id'?: string
  numbers?: number
  'points-charged'?: number
  'balance-after'?: number
  'unix-timestamp'?: number
  code?: string
  description?: string
}

interface BalanceResult {
  result: string
  available?: number
  purchased?: number
  code?: string
  description?: string
}

interface SenderIdResult {
  result: string
  senderid?: string[]
  code?: string
  description?: string
}

interface CoverageResult {
  result: string
  prefixes?: string[]
  code?: string
  description?: string
}

export type { SendResult, BalanceResult, SenderIdResult, CoverageResult }

const API_TIMEOUT_MS = 15_000

async function apiCall<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  debug('kwtsms-client', `API call to ${endpoint}`)

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })

  const data = await response.json() as T
  debug('kwtsms-client', `API response from ${endpoint}`, { result: (data as Record<string, unknown>).result })
  return data
}

export async function sendSms(
  username: string,
  password: string,
  mobile: string,
  message: string,
  senderId: string,
  testMode: boolean
): Promise<SendResult> {
  log('kwtsms-client', 'Sending SMS', { mobile: mobile.slice(0, 3) + '****' })

  const result = await apiCall<SendResult>(ENDPOINTS.SEND, {
    username,
    password,
    sender: senderId,
    mobile,
    message,
    test: testMode ? 1 : 0,
  })

  if (result.result === 'OK') {
    log('kwtsms-client', 'SMS sent', {
      msgId: result['msg-id'],
      numbers: result.numbers,
      pointsCharged: result['points-charged'],
      balanceAfter: result['balance-after'],
    })
  } else {
    logError('kwtsms-client', 'SMS send failed', { code: result.code, description: result.description })
  }

  return result
}

export async function getBalance(username: string, password: string): Promise<BalanceResult> {
  debug('kwtsms-client', 'Fetching balance')
  return apiCall<BalanceResult>(ENDPOINTS.BALANCE, { username, password })
}

export async function getSenderIds(username: string, password: string): Promise<SenderIdResult> {
  debug('kwtsms-client', 'Fetching sender IDs')
  return apiCall<SenderIdResult>(ENDPOINTS.SENDERID, { username, password })
}

export async function getCoverage(username: string, password: string): Promise<CoverageResult> {
  debug('kwtsms-client', 'Fetching coverage')
  return apiCall<CoverageResult>(ENDPOINTS.COVERAGE, { username, password })
}

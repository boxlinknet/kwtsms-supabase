// Default configuration values and constants
// Related: sms-admin/index.ts, 010_seed_defaults.sql

export const DEFAULTS = {
  SENDER_ID: 'KWT-SMS',
  COUNTRY_CODE: '965',
  TEST_MODE: true,
  GATEWAY_ENABLED: false,
  DEBUG_LOGGING: true,
} as const

export const KWTSMS_API_BASE = 'https://www.kwtsms.com/API'

export const ENDPOINTS = {
  SEND: `${KWTSMS_API_BASE}/send/`,
  BALANCE: `${KWTSMS_API_BASE}/balance/`,
  SENDERID: `${KWTSMS_API_BASE}/senderid/`,
  COVERAGE: `${KWTSMS_API_BASE}/coverage/`,
  VALIDATE: `${KWTSMS_API_BASE}/validate/`,
  STATUS: `${KWTSMS_API_BASE}/status/`,
} as const

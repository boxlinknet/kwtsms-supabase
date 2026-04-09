// Phone normalization using kwtsms PHONE_RULES for full validation
// Basic normalization (strip, prepend country code) is done in PL/pgSQL trigger
// This module provides full validation before sending
// Related: send-sms/index.ts, sms-auth-hook/index.ts

let normalizePhoneFn: ((phone: string) => string) | null = null
let validatePhoneFormatFn: ((phone: string) => { valid: boolean; error?: string }) | null = null
let findCountryCodeFn: ((phone: string) => string | null) | null = null

// Try to load kwtsms package, fall back to basic implementation
try {
  const kwtsms = await import('npm:kwtsms')
  normalizePhoneFn = kwtsms.normalizePhone
  validatePhoneFormatFn = kwtsms.validatePhoneFormat
  findCountryCodeFn = kwtsms.findCountryCode
} catch {
  // kwtsms package not available in Deno, use fallback
}

export function normalizePhone(phone: string, defaultCountryCode: string = '965'): string {
  if (normalizePhoneFn) {
    const result = normalizePhoneFn(phone)
    // Package doesn't prepend country code for local numbers
    if (result && /^\d+$/.test(result) && result.length <= 9 && result.length >= 7) {
      return defaultCountryCode + result
    }
    return result
  }
  // Fallback: basic normalization
  let cleaned = phone
  // Convert Arabic-Indic digits
  cleaned = cleaned.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  cleaned = cleaned.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
  // Strip non-digits
  cleaned = cleaned.replace(/\D/g, '')
  // Strip leading 00
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2)
  // Strip leading 0
  if (cleaned.startsWith('0') && cleaned.length > 1) cleaned = cleaned.slice(1)
  // Prepend country code if short
  if (cleaned.length <= 9 && cleaned.length >= 7) {
    cleaned = defaultCountryCode + cleaned
  }
  return cleaned
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (validatePhoneFormatFn) {
    return validatePhoneFormatFn(phone)
  }
  // Fallback: basic validation
  if (!phone || phone.length < 8 || phone.length > 15) {
    return { valid: false, error: `Invalid phone length: ${phone?.length || 0}` }
  }
  if (!/^\d+$/.test(phone)) {
    return { valid: false, error: 'Phone contains non-digit characters' }
  }
  return { valid: true }
}

export function findCountryCode(phone: string): string | null {
  if (findCountryCodeFn) {
    return findCountryCodeFn(phone)
  }
  return null
}

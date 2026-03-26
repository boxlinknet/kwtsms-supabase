// Template rendering: replaces {{placeholder}} with values from a variables object
// Related: send-sms/index.ts, sms-auth-hook/index.ts

export function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replaceAll(`{{${key}}}`, value)
  }
  return result
}

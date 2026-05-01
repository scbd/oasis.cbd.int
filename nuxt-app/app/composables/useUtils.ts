export function formatDate(value?: string | null, _format = 'DD MMM YYYY HH:mm'): string {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function lstring(
  ltext: Record<string, string> | string | number | null | undefined,
  locale = 'en'
): string {
  if (ltext === null || ltext === undefined) return ''
  if (typeof ltext === 'number') return String(ltext)
  if (typeof ltext === 'string') return ltext
  return ltext[locale] ?? ltext['en'] ?? Object.values(ltext)[0] ?? ''
}

export function isRealm(realmCode: string, realm: string): boolean {
  return realm?.toUpperCase().startsWith(realmCode.toUpperCase())
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function camelCaseToWords(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (s) => s.toUpperCase())
}

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

export function uid(prefix = 'id'): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
  return `${prefix}_${random.replace(/-/g, '').slice(0, 12)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

/** Split a textarea value into bullet lines, dropping blanks. */
export function splitBullets(text: string | undefined): string[] {
  if (!text) return []
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean)
}

/** Split a comma separated value into trimmed tokens. */
export function csv(text: string | undefined): string[] {
  if (!text) return []
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function words(text: string | undefined): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function stripProtocol(url: string | undefined): string {
  if (!url) return ''
  return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
}

/** Normalise a link the user typed so it can be clicked in the UI. */
export function toHref(url: string | undefined): string {
  if (!url) return ''
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url
  return `https://${url}`
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'Unknown'
  const diff = Date.now() - then
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'just now'
  if (diff < hour) return `${Math.floor(diff / minute)} min ago`
  if (diff < day) return `${Math.floor(diff / hour)} h ago`
  if (diff < 7 * day) return `${Math.floor(diff / day)} d ago`
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function safeFileName(name: string): string {
  return (
    name
      .trim()
      .replace(/[^a-z0-9\-_ ]/gi, '')
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'resume'
  )
}

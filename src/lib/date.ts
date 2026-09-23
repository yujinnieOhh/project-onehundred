/** Returns the calendar date (YYYY-MM-DD) for a given instant in a given IANA timezone. */
export function getLocalDateString(timezone: string, date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date)
}

/** Days remaining from `fromDateStr` up to and including `toDateStr` (YYYY-MM-DD strings). D-Day is 0. */
export function daysUntil(fromDateStr: string, toDateStr: string): number {
  const from = Date.parse(`${fromDateStr}T00:00:00Z`)
  const to = Date.parse(`${toDateStr}T00:00:00Z`)
  return Math.round((to - from) / 86_400_000)
}

/** Adds (or subtracts, with a negative delta) whole days to a YYYY-MM-DD string. */
export function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

/** "2026-09-23" -> "2026.09.23" */
export function formatDots(dateStr: string): string {
  return dateStr.replaceAll('-', '.')
}

/** Monday (start of week, Mon-Sun) of the week containing `dateStr`. */
export function mondayOfWeek(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  const day = d.getUTCDay() // 0=Sun..6=Sat
  const diff = day === 0 ? 6 : day - 1
  d.setUTCDate(d.getUTCDate() - diff)
  return d.toISOString().slice(0, 10)
}

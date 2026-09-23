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

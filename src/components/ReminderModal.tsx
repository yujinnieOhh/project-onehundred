'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'p100_reminder_modal_shown'

function buildCalendarLink() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(21, 0, 0, 0)
  if (start < now) start.setDate(start.getDate() + 1)
  const end = new Date(start.getTime() + 15 * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'PROJECT ONE HUNDRED 오늘 기록하기',
    dates: `${fmt(start)}/${fmt(end)}`,
    recur: 'RRULE:FREQ=DAILY',
    details: '오늘의 목표를 완료했는지 기록해보세요.',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function ReminderModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true)
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-surface p-6 text-center">
        <p className="text-base font-semibold text-text-primary">
          매일 기록하는 걸 잊지 않도록 할까요? 🔔
        </p>
        <div className="flex w-full flex-col gap-2">
          <a
            href={buildCalendarLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="rounded-full bg-text-primary px-6 py-3 text-center font-semibold text-white"
          >
            리마인더 설정하기
          </a>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full border border-border bg-surface px-6 py-3 font-semibold text-text-primary"
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  )
}

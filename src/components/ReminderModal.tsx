'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'p100_reminder_modal_shown'
const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/g9zWWXOi'

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
          매일 기록하는 걸 잊지 않도록 도와드릴까요?
        </p>
        <p className="text-sm text-text-secondary">
          오픈채팅방에 들어와서 매일 밤 10시에 알림도 받아보세요!
        </p>
        <div className="flex w-full flex-col gap-2">
          <a
            href={KAKAO_OPEN_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismiss}
            className="rounded-full bg-text-primary px-6 py-3 text-center font-semibold text-white"
          >
            오픈채팅방 들어가기
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

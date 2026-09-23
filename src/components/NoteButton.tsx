'use client'

import { useState, useTransition } from 'react'
import { saveNote } from '@/app/main/actions'
import { getPostHog } from '@/lib/posthog-client'

export function NoteButton({ initialNote }: { initialNote: string | null }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(initialNote ?? '')
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-text-primary px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        메모도 할게
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:px-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex w-full max-w-sm flex-col gap-4 rounded-t-3xl bg-surface p-6 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text-secondary">메모</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-text-secondary"
              >
                닫기
              </button>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="오늘 어땠나요?"
              autoFocus
              className="w-full rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-pink-primary"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await saveNote(note)
                  getPostHog().capture('note_saved')
                  setOpen(false)
                })
              }
              className="rounded-full bg-text-primary px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>
      )}
    </>
  )
}

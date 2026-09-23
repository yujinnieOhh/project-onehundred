'use client'

import { useState, useTransition } from 'react'
import { saveNote } from '@/app/main/actions'

export function NoteButton({ initialNote }: { initialNote: string | null }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(initialNote ?? '')
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-border bg-surface px-6 py-3 font-semibold text-text-primary"
      >
        메모
      </button>
      {open && (
        <div className="flex flex-col gap-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="오늘 어땠나요?"
            className="w-full rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-pink-primary"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await saveNote(note)
                setOpen(false)
              })
            }
            className="self-end rounded-full bg-text-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            저장
          </button>
        </div>
      )}
    </div>
  )
}

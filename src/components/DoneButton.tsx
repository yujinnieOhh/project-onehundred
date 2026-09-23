'use client'

import { useTransition } from 'react'
import { markDone, undoDone } from '@/app/main/actions'
import { getPostHog } from '@/lib/posthog-client'

export function DoneButton({ completedToday }: { completedToday: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={completedToday || isPending}
        onClick={() =>
          startTransition(async () => {
            await markDone()
            getPostHog().capture('challenge_completed')
          })
        }
        className="rounded-full bg-text-primary px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {completedToday ? '해냈음 ✓' : '내가 해냄'}
      </button>
      {completedToday && (
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await undoDone()
              getPostHog().capture('challenge_undone')
            })
          }
          className="text-xs text-text-secondary underline disabled:opacity-50"
        >
          취소
        </button>
      )}
    </div>
  )
}

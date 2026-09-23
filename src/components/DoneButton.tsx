'use client'

import { useTransition } from 'react'
import { markDone, undoDone } from '@/app/main/actions'
import { getPostHog } from '@/lib/posthog-client'

export function DoneButton({ completedToday }: { completedToday: boolean }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () =>
    startTransition(async () => {
      if (completedToday) {
        await undoDone()
        getPostHog().capture('challenge_undone')
      } else {
        await markDone()
        getPostHog().capture('challenge_completed')
      }
    })

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="rounded-full bg-text-primary px-6 py-3 font-semibold text-white disabled:opacity-50"
    >
      {completedToday ? '잘못눌렀어' : '내가 해냄'}
    </button>
  )
}

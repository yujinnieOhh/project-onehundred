'use client'

import { useState, useTransition } from 'react'
import { sendReaction } from '@/app/friends/reaction-actions'
import { REACTION_EMOJIS } from '@/lib/reactions'
import { getPostHog } from '@/lib/posthog-client'

export function ReactionPicker({
  checkinId,
  myReactionEmoji,
}: {
  checkinId: string
  myReactionEmoji: string | null
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (myReactionEmoji) {
    return <span className="text-lg" aria-label={`내가 보낸 반응: ${myReactionEmoji}`}>{myReactionEmoji}</span>
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-text-secondary underline"
      >
        반응하기
      </button>
    )
  }

  return (
    <div className="flex gap-1">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`${emoji} 반응 보내기`}
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await sendReaction(checkinId, emoji)
              getPostHog().capture('reaction_sent', { emoji })
              setOpen(false)
            })
          }
          className="text-lg disabled:opacity-50"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

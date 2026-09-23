'use client'

import { useTransition } from 'react'
import { acceptFriendRequest } from '@/app/friends/actions'

export function AcceptFriendButton({ friendshipId }: { friendshipId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => acceptFriendRequest(friendshipId))}
      className="shrink-0 rounded-full bg-text-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
    >
      수락
    </button>
  )
}

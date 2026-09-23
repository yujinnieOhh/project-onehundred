'use client'

import { useActionState } from 'react'
import { sendFriendRequest, type FriendRequestState } from '@/app/friends/actions'

const initialState: FriendRequestState = { error: null, success: null }

export function FriendRequestForm() {
  const [state, formAction, isPending] = useActionState(sendFriendRequest, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <p className="text-sm font-semibold text-text-secondary">유저네임으로 친구 추가</p>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-1 rounded-[10px] border border-border bg-surface px-3">
          <span className="text-text-secondary">@</span>
          <input
            name="username"
            type="text"
            placeholder="username"
            className="w-full py-3 text-base text-text-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-full bg-text-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          요청
        </button>
      </div>
      {state.error && <p className="text-xs text-pink-deep">{state.error}</p>}
      {state.success && <p className="text-xs text-text-secondary">{state.success}</p>}
    </form>
  )
}

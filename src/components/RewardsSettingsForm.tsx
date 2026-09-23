'use client'

import { useActionState } from 'react'
import { updateRewards, type SettingsState } from '@/app/settings/actions'

const initialState: SettingsState = { error: null, success: null }
const TARGETS = [7, 20, 50, 77, 100]

export function RewardsSettingsForm({
  rewards,
}: {
  rewards: { target_count: number; title: string }[]
}) {
  const [state, formAction, isPending] = useActionState(updateRewards, initialState)
  const byTarget = new Map(rewards.map((r) => [r.target_count, r.title]))

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <p className="text-sm font-semibold text-text-secondary">보상</p>
      {TARGETS.map((t) => (
        <div key={t} className="flex items-center gap-3">
          <span className="w-12 shrink-0 text-sm text-text-secondary">{t}개</span>
          <input
            name={`reward${t}`}
            type="text"
            maxLength={50}
            defaultValue={byTarget.get(t) ?? ''}
            placeholder="좋아하는 케이크 먹기"
            className="w-full rounded-[10px] border border-border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-pink-primary"
          />
        </div>
      ))}
      {state.error && <p className="text-xs text-pink-deep">{state.error}</p>}
      {state.success && <p className="text-xs text-text-secondary">{state.success}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-text-primary px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        저장
      </button>
    </form>
  )
}

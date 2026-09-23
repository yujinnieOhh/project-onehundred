'use client'

import { useActionState } from 'react'
import { updateGoal, type SettingsState } from '@/app/settings/actions'

const initialState: SettingsState = { error: null, success: null }

export function GoalSettingsForm({ goal }: { goal: string }) {
  const [state, formAction, isPending] = useActionState(updateGoal, initialState)

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
    >
      <p className="text-sm font-semibold text-text-secondary">100일 목표</p>
      <input
        name="goal"
        type="text"
        required
        maxLength={40}
        defaultValue={goal}
        className="w-full rounded-[10px] border border-border bg-surface px-4 py-3 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-pink-primary"
      />
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

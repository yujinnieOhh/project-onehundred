'use client'

import { useActionState, useEffect, useState } from 'react'
import { createProfile, type SetupState } from '@/app/setup/actions'
import { Logo } from '@/components/Logo'

const initialState: SetupState = { error: null }

const inputClass =
  'w-full rounded-[10px] border border-border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-pink-primary'

export function SetupForm() {
  const [state, formAction, isPending] = useActionState(createProfile, initialState)
  const [timezone, setTimezone] = useState('')
  const [locale, setLocale] = useState('ko')

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    setLocale(navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en')
  }, [])

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-6 px-5 py-12">
      <div className="text-center">
        <Logo />
      </div>

      <input type="hidden" name="timezone" value={timezone} />
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-2">
        <label htmlFor="nickname" className="text-sm font-semibold text-text-primary">
          닉네임
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          maxLength={20}
          placeholder="유진"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-semibold text-text-primary">
          유저네임 (변경 불가)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">@</span>
          <input
            id="username"
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-z0-9_]{3,20}"
            placeholder="yujin_100"
            className={inputClass}
          />
        </div>
        <p className="text-xs text-text-secondary">영문 소문자, 숫자, _ 3~20자</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="goal" className="text-sm font-semibold text-text-primary">
          100일 목표
        </label>
        <input
          id="goal"
          name="goal"
          type="text"
          required
          maxLength={40}
          placeholder="하루 30분 공부하기"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-text-primary">보상 (선택)</p>
        {[
          { name: 'reward7', label: '7개' },
          { name: 'reward20', label: '20개' },
          { name: 'reward50', label: '50개' },
          { name: 'reward77', label: '77개' },
          { name: 'reward100', label: '100개' },
        ].map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-sm text-text-secondary">{r.label}</span>
            <input
              name={r.name}
              type="text"
              maxLength={50}
              placeholder="좋아하는 케이크 먹기"
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {state?.error && <p className="text-sm text-pink-deep">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-text-primary px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {isPending ? '만드는 중...' : 'START MY 100 DAYS'}
      </button>
    </form>
  )
}

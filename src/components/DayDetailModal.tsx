'use client'

import { useEffect, useState } from 'react'
import { getDayDetail, type DayDetail } from '@/app/habit/actions'
import { formatDots } from '@/lib/date'

export function DayDetailModal({
  date,
  onClose,
}: {
  date: string
  onClose: () => void
}) {
  const [detail, setDetail] = useState<DayDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getDayDetail(date).then((result) => {
      if (!cancelled) {
        setDetail(result)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [date])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:px-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-sm flex-col gap-4 overflow-y-auto rounded-t-3xl bg-surface p-6 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">{formatDots(date)}</h2>
          <button type="button" onClick={onClose} className="text-sm text-text-secondary">
            닫기
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-text-secondary">불러오는 중...</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-text-primary">
              {detail?.completed ? '완료 ✓' : '미완료'}
            </p>

            {detail?.note && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-text-secondary">메모</p>
                <p className="whitespace-pre-wrap text-sm text-text-primary">{detail.note}</p>
              </div>
            )}

            {detail && detail.reactions.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-text-secondary">친구 반응</p>
                {detail.reactions.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{r.emoji}</span>
                    <span className="text-text-primary">
                      {r.nickname} <span className="text-text-secondary">@{r.username}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

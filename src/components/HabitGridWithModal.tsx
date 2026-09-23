'use client'

import { useState } from 'react'
import { HabitPreviewGrid, type HabitCellState } from '@/components/HabitPreviewGrid'
import { DayDetailModal } from '@/components/DayDetailModal'

export function HabitGridWithModal({
  cells,
}: {
  cells: { date: string; state: HabitCellState; hasReaction?: boolean }[]
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  return (
    <>
      <HabitPreviewGrid cells={cells} onCellClick={setSelectedDate} />
      {selectedDate && (
        <DayDetailModal date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </>
  )
}

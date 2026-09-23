import type { HabitCellState } from '@/components/HabitPreviewGrid'

export function habitCellState(
  date: string,
  today: string,
  joinDate: string,
  isCompleted: boolean
): HabitCellState {
  if (date > today) return 'future'
  if (date < joinDate) return 'preJoin'
  if (isCompleted) return 'completed'
  if (date < today) return 'missed'
  return 'todayPending'
}

import Image from 'next/image'

export type HabitCellState = 'future' | 'preJoin' | 'completed' | 'missed' | 'todayPending'

const imageByState: Partial<Record<HabitCellState, string>> = {
  completed: '/images/animals/sg_stamp.png',
  missed: '/images/animals/sg_stamp_missed.png',
  todayPending: '/images/animals/sg_stamp_today.png',
}

export function HabitPreviewGrid({
  cells,
}: {
  cells: { date: string; state: HabitCellState; hasReaction?: boolean }[]
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {cells.map((cell) => (
        <div key={cell.date} className="relative aspect-square">
          {cell.state === 'future' ? (
            <div className="h-full w-full rounded-full bg-future-circle" />
          ) : cell.state === 'preJoin' ? (
            <div className="h-full w-full rounded-full border border-border" />
          ) : (
            <Image
              src={imageByState[cell.state]!}
              alt=""
              fill
              sizes="40px"
              className="object-contain"
              style={
                cell.hasReaction
                  ? {
                      filter:
                        'drop-shadow(0 0 1px #F49AB5) drop-shadow(0 0 4px rgba(244,154,181,.8))',
                    }
                  : undefined
              }
            />
          )}
        </div>
      ))}
    </div>
  )
}

import Image from 'next/image'
import Link from 'next/link'

export type HabitCellState = 'future' | 'preJoin' | 'completed' | 'missed' | 'todayPending'

const imageByState: Partial<Record<HabitCellState, string>> = {
  completed: '/images/animals/sg_stamp.png',
  missed: '/images/animals/sg_stamp_missed.png',
  todayPending: '/images/animals/sg_stamp_today.png',
}

const CLICKABLE_STATES: HabitCellState[] = ['completed', 'missed', 'todayPending']

export function HabitPreviewGrid({
  cells,
  linkBase,
}: {
  cells: { date: string; state: HabitCellState; hasReaction?: boolean }[]
  /** When set, completed/missed/todayPending cells link to `${linkBase}/${date}`. */
  linkBase?: string
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {cells.map((cell) => {
        const content =
          cell.state === 'future' ? (
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
          )

        const clickable = linkBase && CLICKABLE_STATES.includes(cell.state)

        return (
          <div key={cell.date} className="relative aspect-square">
            {clickable ? (
              <Link href={`${linkBase}/${cell.date}`} className="block h-full w-full">
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        )
      })}
    </div>
  )
}

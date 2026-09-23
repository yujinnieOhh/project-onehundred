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
  onCellClick,
}: {
  cells: { date: string; state: HabitCellState; hasReaction?: boolean }[]
  /** Completed/missed/todayPending cells link to `${linkBase}/${date}`. Ignored if `onCellClick` is set. */
  linkBase?: string
  /** Completed/missed/todayPending cells call this instead of navigating (e.g. to open a modal). */
  onCellClick?: (date: string) => void
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

        const clickable = CLICKABLE_STATES.includes(cell.state) && (onCellClick || linkBase)

        return (
          <div key={cell.date} className="relative aspect-square">
            {!clickable ? (
              content
            ) : onCellClick ? (
              <button
                type="button"
                onClick={() => onCellClick(cell.date)}
                className="block h-full w-full"
              >
                {content}
              </button>
            ) : (
              <Link href={`${linkBase}/${cell.date}`} className="block h-full w-full">
                {content}
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

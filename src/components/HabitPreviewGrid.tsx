import Image from 'next/image'

export type HabitCellState = 'future' | 'preJoin' | 'completed' | 'missed'

export function HabitPreviewGrid({
  cells,
}: {
  cells: { date: string; state: HabitCellState }[]
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {cells.map((cell) => (
        <div key={cell.date} className="relative aspect-square">
          {cell.state === 'future' ? (
            <div className="h-full w-full rounded-full bg-future-circle" />
          ) : cell.state === 'preJoin' ? (
            <div className="h-full w-full rounded-full border border-border" />
          ) : (
            <Image
              src="/images/animals/sg_stamp.png"
              alt=""
              fill
              sizes="40px"
              className={cell.state === 'missed' ? 'object-contain opacity-[0.78] brightness-0' : 'object-contain'}
            />
          )}
        </div>
      ))}
    </div>
  )
}

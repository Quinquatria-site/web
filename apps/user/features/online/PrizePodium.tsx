/** 상품 한 칸. rank 는 '1등' 같은 읽는 이름 */
type Prize = { rank: string; name: string }

// 1·2·3등을 2·1·3 순으로 놓고 단 높이로 등수를 보인다
const PLACES = [
  { order: 'order-2', step: 'h-16 bg-primary bg-linear-to-r from-primary/20 to-white/20' },
  { order: 'order-1', step: 'h-11 bg-(--beige-peach)' },
  { order: 'order-3', step: 'h-8 border border-b-0 border-(--beige-peach) bg-(--warm-white)' },
]

/** 상품 시상대. 등수 순으로 읽히고 화면에는 2·1·3 단으로 선다 */
export function PrizePodium({ label, prizes }: { label: string; prizes: Prize[] }) {
  return (
    <ol aria-label={label} className="grid grid-cols-[1fr_1.15fr_1fr] items-end gap-1.5 pt-1">
      {prizes.slice(0, PLACES.length).map((prize, i) => (
        <li
          key={prize.rank}
          className={`flex flex-col items-center gap-1.5 text-center ${PLACES[i].order}`}
        >
          <p className="text-[12.5px] leading-[1.3] font-semibold text-balance">
            <span className="sr-only">{prize.rank} </span>
            {prize.name}
          </p>
          <div
            aria-hidden
            className={`grid w-full place-items-center rounded-t-lg text-lg font-extrabold text-secondary ${PLACES[i].step}`}
          >
            {i + 1}
          </div>
        </li>
      ))}
    </ol>
  )
}

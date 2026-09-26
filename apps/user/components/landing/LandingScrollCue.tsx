// 아래 꺾쇠가 0.15초 늦게 나오고 0.25초 늦게 깜빡여 빛이 아래로 흐르는 것처럼 보인다
const CHEVRONS = [
  { d: 'M0 0L20 20L39 0', enter: '[--cue-in-delay:300ms]', pulse: '[--cue-pulse-delay:800ms]' },
  { d: 'M0 19L20 39L39 19', enter: '[--cue-in-delay:450ms]', pulse: '[--cue-pulse-delay:1050ms]' },
]

/** 랜딩 아래 가운데의 두 줄 꺾쇠. 위에서 차례로 내려와 빛이 아래로 흐르듯 깜빡이고, 누르면 onPress 를 부른다 */
export function LandingScrollCue({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      aria-label="다음 섹션으로"
      onClick={onPress}
      // 피그마 39 상자보다 누를 곳을 넓히되 꺾쇠 중심은 피그마 자리에 둔다
      className="absolute bottom-[54.5px] left-1/2 grid size-12 -translate-x-1/2 place-items-center"
    >
      <svg
        width="39"
        height="39"
        viewBox="0 0 39 39"
        fill="none"
        stroke="var(--warm-white)"
        strokeWidth="4"
        strokeLinecap="round"
        aria-hidden
        className="overflow-visible drop-shadow-[0_0_12px_var(--warm-white)]"
      >
        {CHEVRONS.map(({ d, enter, pulse }) => (
          // 등장과 깜빡임이 둘 다 opacity 를 써서 겹치지 않게 g 와 path 에 나눠 건다
          <g key={d} className={`motion-safe:animate-cue-in ${enter}`}>
            <path d={d} className={`motion-safe:animate-cue-pulse ${pulse}`} />
          </g>
        ))}
      </svg>
    </button>
  )
}

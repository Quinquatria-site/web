/** 타임라인 점. 진행 중이면 노을빛으로 번지고 파동이 퍼진다 */
export function TimelineDot({ active }: { active: boolean }) {
  return (
    <span className="relative size-2">
      {active && (
        <span className="absolute inset-0 animate-dot-ping rounded-full bg-(--sunlight) opacity-70 motion-reduce:animate-none" />
      )}
      <span
        className={`absolute inset-0 rounded-full bg-text-inverse ${active ? 'shadow-[0_0_4px_3px_var(--sunlight)]' : ''}`}
      />
    </span>
  )
}

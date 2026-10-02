/** 주인에게 돌려준 분실물 표시. 목록 카드와 상세가 함께 쓰고, 놓일 자리는 쓰는 쪽이 className 으로 정한다 */
export function ReturnedBadge({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span
      className={`${className} rounded-xl bg-secondary px-2 py-1 text-xs leading-[normal] font-semibold whitespace-nowrap text-on-secondary`}
    >
      {label}
    </span>
  )
}

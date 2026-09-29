import { LostItemCard } from './LostItemCard'
import type { LostItem } from './lost-item'

/** 분실물 카드를 두 줄로 깐다 */
export function LostItemGrid({ items }: { items: LostItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <LostItemCard item={item} />
        </li>
      ))}
    </ul>
  )
}

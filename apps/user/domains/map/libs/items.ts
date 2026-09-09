import type { Copy } from '@/libs/i18n'
import type { Booth } from '@/mocks/booths'
import type { Place } from '@/mocks/places'

export type MarkerKind = 'booth' | 'pub' | 'aid'

export type MapItem = (Booth & { kind: 'booth' }) | Place

export function itemTitle(item: MapItem, copy: Copy) {
  return item.kind === 'booth' ? copy.map.boothAt(item.zone, item.number) : copy.map.kind[item.kind]
}

export function itemName(item: MapItem, copy: Copy) {
  return item.kind === 'booth' ? copy.map.boothName : item.name
}

/** 마커 안에 찍히는 글자. 부스는 번호, 나머지는 한 글자. */
export function markerLabel(item: MapItem, copy: Copy) {
  if (item.kind === 'booth') return String(item.number)
  return item.kind === 'pub' ? copy.map.pubMark : '+'
}

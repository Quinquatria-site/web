import type { Booth } from '@/mocks/booths'
import type { Place } from '@/mocks/places'

export type MarkerKind = 'booth' | 'pub' | 'aid'

export type MapItem = (Booth & { kind: 'booth' }) | Place

export const KIND_LABEL: Record<MarkerKind, string> = {
  booth: '부스',
  pub: '주점',
  aid: '의무실',
}

export function itemTitle(item: MapItem) {
  return item.kind === 'booth' ? `${item.zone}구역 ${item.number}번` : KIND_LABEL[item.kind]
}

export function itemName(item: MapItem) {
  return item.kind === 'booth' ? '[부스 이름]' : item.name
}

/** 마커 안에 찍히는 글자. 부스는 번호, 나머지는 한 글자. */
export function markerLabel(item: MapItem) {
  if (item.kind === 'booth') return String(item.number)
  return item.kind === 'pub' ? '주' : '+'
}

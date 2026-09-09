import type { Copy, Lang } from '@/libs/i18n'
import type { Booth } from '@/mocks/booths'
import type { Place, PlaceKind } from '@/mocks/types'

export type MarkerKind = 'booth' | PlaceKind

/** 필터 칩이 놓이는 차례이기도 하다. */
export const MARKER_KINDS: MarkerKind[] = ['booth', 'pub', 'aid', 'bin', 'food']

export type MapItem = (Booth & { kind: 'booth' }) | Place

export function itemTitle(item: MapItem, copy: Copy) {
  return item.kind === 'booth' ? copy.map.boothAt(item.zone, item.number) : copy.map.kind[item.kind]
}

export function itemName(item: MapItem, copy: Copy, lang: Lang) {
  return item.kind === 'booth' ? copy.map.boothName : item.name[lang]
}

/** 마커 하나를 가리키는 한 줄. 눌러 보기 전에 무엇인지 알려 준다. */
export function itemLabel(item: MapItem, copy: Copy, lang: Lang) {
  return item.kind === 'booth' ? itemTitle(item, copy) : item.name[lang]
}

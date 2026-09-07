import type { SectionId } from './campus'

export type MarkerKind = 'booth' | 'pub' | 'aid'

export type Booth = {
  kind: 'booth'
  id: string
  section: SectionId
  number: number
  x: number
  y: number
}

export type Place = {
  kind: 'pub' | 'aid'
  id: string
  name: string
  x: number
  y: number
}

export type MapItem = Booth | Place

export const KIND_LABEL: Record<MarkerKind, string> = {
  booth: '부스',
  pub: '주점',
  aid: '의무실',
}

export function itemTitle(item: MapItem) {
  return item.kind === 'booth' ? `${item.section}구역 ${item.number}번 부스` : KIND_LABEL[item.kind]
}

export function itemName(item: MapItem) {
  return item.kind === 'booth' ? '부스 이름 (임시)' : item.name
}

export function markerLabel(item: MapItem) {
  if (item.kind === 'booth') return String(item.number)
  return item.kind === 'pub' ? '주' : '+'
}

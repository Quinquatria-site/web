import { API_LANGUAGE, type Locale } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import type { MapPoint } from './map-coords'
import type { MapPlace } from './map-place'

// 팔찌 수령 영역 꼭짓점
const BRACELET_AREA: MapPoint[] = [
  { x: 761, y: 568 },
  { x: 821, y: 637 },
  { x: 889, y: 568 },
]

// 고를 때 화면을 옮길 기준점. 꼭짓점들의 평균이다
function centerOf(area: MapPoint[]): MapPoint {
  const sum = area.reduce((acc, { x, y }) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 })
  return { x: sum.x / area.length, y: sum.y / area.length }
}

/** 서버에서 받지 않고 프론트에 둔 장소. 팔찌 수령처는 점이 아니라 영역이라 서버 장소 형식에 담기지 않는다 */
export function getLocalPlaces(locale: Locale): MapPlace[] {
  const { braceletPickup } = getMessages(locale).map
  return [
    {
      id: 'bracelet',
      code: 'BRACELET',
      category_id: 0,
      category_sequence: 0,
      ...centerOf(BRACELET_AREA),
      area: BRACELET_AREA,
      name: braceletPickup.name,
      host_college: '',
      description: braceletPickup.description,
      // 시각만 보여 주니 날짜는 축제 첫날로 둔다. 끝나는 시각이 없어 end_hour 는 비운다
      start_hour: '2026-10-07T15:00:00+09:00',
      end_hour: '',
      place_image_uri: ['/places/minerva-complex.jpg'],
      menus: [],
      language_code: API_LANGUAGE[locale],
    },
  ]
}

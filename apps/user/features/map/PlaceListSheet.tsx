'use client'

import { BottomSheet, BottomSheetTitle } from '@/shared/bottom-sheet/BottomSheet'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import type { MapPlace, PlaceCode } from './map-place'
import { FILTER_CODES } from './PlaceFilter'
import { PlaceRows } from './PlaceRows'
import { PLACE_SHEET_PEEK } from './PlaceSheet'

/** 상단 칩에 맞는 장소 목록 시트. 끝까지 펼쳐 열고, 줄을 누르면 상세로 간다 */
export function PlaceListSheet({
  open,
  places,
  filter,
  hidden,
  fullHeight,
  onPick,
  onClose,
}: {
  open: boolean
  /** 칩으로 거른 장소. 지도 마커와 같은 배열이다 */
  places: MapPlace[]
  filter: ReadonlySet<PlaceCode>
  hidden: boolean
  /** 끝까지 올렸을 때 높이. 칩 줄 아래에서 멈춰 칩을 계속 누를 수 있게 한다 */
  fullHeight: string
  onPick: (place: MapPlace) => void
  onClose: () => void
}) {
  const { map } = getMessages(useLocale())
  const title = filter.size
    ? FILTER_CODES.filter((code) => filter.has(code))
        .map((code) => map.places[code])
        .join(', ')
    : map.filterAll

  return (
    <BottomSheet
      open={open}
      hidden={hidden}
      peekHeight={PLACE_SHEET_PEEK}
      fullHeight={fullHeight}
      dismissFromFull
      expanded
      // 끝까지 올려도 위 칩으로 목록을 바꿀 수 있게 뒤 화면을 막지 않는다
      blockBehind={false}
      onClose={onClose}
    >
      <div className="flex items-baseline gap-1.5 px-2 pb-1">
        <BottomSheetTitle className="text-lg leading-[normal] font-semibold">
          {title}
        </BottomSheetTitle>
        <span className="text-sm text-text-muted">
          {map.list.count.replace('{count}', String(places.length))}
        </span>
      </div>
      <div className="px-2">
        <PlaceRows places={places} onPick={onPick} />
      </div>
    </BottomSheet>
  )
}

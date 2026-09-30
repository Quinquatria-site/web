'use client'

import { useState } from 'react'
import {
  BottomSheet,
  BottomSheetDescription,
  BottomSheetTitle,
} from '@/shared/bottom-sheet/BottomSheet'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { formatSeoulTime } from '@/shared/time/format-seoul-time'
import { type MapPlace, placeLabel } from './map-place'
import { PLACE_BG } from './place-colors'

/** 시트 1단계 높이(피그마 197). 이름·운영·시간·위치까지 보인다 */
export const PLACE_SHEET_PEEK = 197

// 이름 옆 카테고리 뱃지. 마커와 같은 고유 색을 깐다
function PlaceBadge({ place }: { place: MapPlace }) {
  const name = getMessages(useLocale()).map.places[place.code]
  return (
    <span
      className={`shrink-0 rounded-xl px-2 py-1 text-xs leading-[normal] font-semibold text-text-inverse ${PLACE_BG[place.code]}`}
    >
      {name}
    </span>
  )
}

// 1단계에 보이는 요약. 값이 없는 줄(편의시설의 운영·위치)은 뺀다
function PlaceSummary({ place }: { place: MapPlace }) {
  const { sheet } = getMessages(useLocale()).map
  const label = placeLabel(place)
  const rows = [
    { key: 'host', term: sheet.host, value: place.host_college },
    {
      key: 'hours',
      term: sheet.hours,
      value: `${formatSeoulTime(place.start_hour)} - ${formatSeoulTime(place.end_hour)}`,
    },
    { key: 'location', term: sheet.location, value: label },
  ].filter((row) => row.value)

  return (
    <div className="flex flex-col gap-3 px-2">
      <div className="flex items-center gap-2.5">
        <BottomSheetTitle className="text-2xl leading-[normal] font-semibold">
          {place.name}
        </BottomSheetTitle>
        <PlaceBadge place={place} />
      </div>
      <BottomSheetDescription asChild>
        <dl className="flex flex-col gap-2 leading-[1.18]">
          {rows.map((row) => (
            <div key={row.key} className="flex gap-3">
              <dt className="text-text-muted">{row.term}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </BottomSheetDescription>
    </div>
  )
}

/** 고른 장소 시트. 1단계로 올라오고, 닫으면 선택을 푼다 */
export function PlaceSheet({
  place,
  hidden,
  onClose,
}: {
  place: MapPlace | null
  hidden: boolean
  onClose: () => void
}) {
  // 닫히며 내려가는 동안에도 내용이 남아 있게 마지막 장소를 쥐고 있는다
  const [shown, setShown] = useState(place)
  if (place && place !== shown) setShown(place)
  const current = place ?? shown

  return (
    <BottomSheet
      open={place !== null}
      hidden={hidden}
      peekHeight={PLACE_SHEET_PEEK}
      onClose={onClose}
    >
      {current && <PlaceSummary place={current} />}
    </BottomSheet>
  )
}

'use client'

import { type ReactNode, useState } from 'react'
import {
  BottomSheet,
  BottomSheetDescription,
  BottomSheetTitle,
} from '@/shared/bottom-sheet/BottomSheet'
import { useCloseWatcher } from '@/shared/history/useCloseWatcher'
import { contentLang } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { type MapPlace, placeHours, placeLabel } from './map-place'
import { LinkedText } from './LinkedText'
import { MenuCard } from './MenuCard'
import { PLACE_BG } from './place-colors'
import { PLACE_PHOTO_HEIGHT, PlacePhotos } from './PlacePhotos'
import { ShareLinkButton } from './ShareLinkButton'

/** 시트 1단계 높이. 이름·운영·시간·위치 아래 사진 줄까지 보인다 */
export const PLACE_SHEET_PEEK = 197 + PLACE_PHOTO_HEIGHT

/** 이름 옆 카테고리 뱃지. 마커와 같은 고유 색을 깐다 */
export function PlaceBadge({ place }: { place: MapPlace }) {
  const name = getMessages(useLocale()).map.places[place.code]
  return (
    <span
      className={`shrink-0 rounded-xl px-2 py-1 text-xs leading-[normal] font-semibold text-text-inverse ${PLACE_BG[place.code]}`}
    >
      {name}
    </span>
  )
}

// 1단계에 보이는 이름·운영 정보·사진과 이어지는 설명. 값이 없는 줄(편의시설의 운영·위치, 시간 없는 프론트 장소의 운영 시간)은 뺀다
function PlaceSummary({ place }: { place: MapPlace }) {
  const { sheet } = getMessages(useLocale()).map
  const label = placeLabel(place)
  const lang = contentLang(place.language_code)
  const rows = [
    { key: 'host', term: sheet.host, value: place.host_college, lang },
    { key: 'hours', term: sheet.hours, value: placeHours(place) },
    { key: 'location', term: sheet.location, value: label },
  ].filter((row) => row.value)

  return (
    <div className="flex flex-col gap-3 px-2">
      <BottomSheetTitle lang={lang} className="text-2xl leading-[normal] font-semibold">
        {place.name}
      </BottomSheetTitle>
      <div className="flex flex-col gap-5">
        <BottomSheetDescription asChild>
          <dl className="flex flex-col gap-2 leading-[1.18]">
            {rows.map((row) => (
              <div key={row.key} className="flex gap-3">
                <dt className="text-text-muted">{row.term}</dt>
                <dd lang={row.lang}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </BottomSheetDescription>
        {/* 다른 장소로 바뀌면 첫 사진부터 다시 보인다 */}
        <PlacePhotos
          key={`photos-${place.id}`}
          images={place.place_image_uri ?? []}
          alt={place.name ?? ''}
        />
        {/* 백오피스에서 넣은 줄바꿈을 그대로 살리고, 긴 주소는 칸 안에서 끊고 링크로 연다 */}
        {place.description && (
          <p lang={lang} className="leading-[1.4] whitespace-pre-line wrap-break-word">
            <LinkedText text={place.description} />
          </p>
        )}
      </div>
    </div>
  )
}

// 2단계에서 이어지는 한 덩어리. 위에 구분선을 긋고 제목을 단다
function SheetSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <hr className="border-sheet-divider" />
      <section className="flex flex-col gap-3 px-2">
        <h3 className="text-xl leading-[normal] font-semibold">{title}</h3>
        {children}
      </section>
    </>
  )
}

// 시트 본문 전체. 1단계는 사진 줄까지 보이고, 끌어 올리면 설명·메뉴가 이어진다
function PlaceDetails({ place }: { place: MapPlace }) {
  const { sheet } = getMessages(useLocale()).map
  return (
    <div className="flex flex-col gap-5">
      <PlaceSummary place={place} />
      {place.menus.length > 0 && (
        <SheetSection title={sheet.menu}>
          <ul className="flex flex-col gap-2">
            {place.menus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} />
            ))}
          </ul>
        </SheetSection>
      )}
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
  useCloseWatcher(place !== null, onClose)

  return (
    <BottomSheet
      open={place !== null}
      hidden={hidden}
      peekHeight={PLACE_SHEET_PEEK}
      // 장소 주소는 기록 없이 갈아 끼우기만 해서, 뒤로 가기는 기록 대신 CloseWatcher 로 받는다
      closeOnBack={false}
      revealKey={place?.id}
      onClose={onClose}
      headerStart={
        current && (
          <>
            <PlaceBadge place={current} />
            {/* 다른 장소로 바뀌면 복사했어요 표시가 남지 않게 새로 그린다 */}
            <ShareLinkButton key={current.id} place={current} />
          </>
        )
      }
    >
      {current && <PlaceDetails place={current} />}
    </BottomSheet>
  )
}

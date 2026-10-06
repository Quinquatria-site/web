'use client'

import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import {
  BottomSheet,
  BottomSheetDescription,
  BottomSheetTitle,
  SLIDE,
  useBottomSheetStep,
} from '@/shared/bottom-sheet/BottomSheet'
import { useCloseWatcher } from '@/shared/history/useCloseWatcher'
import { contentLang } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { type MapPlace, placeHours, placeLabel } from './map-place'
import { LinkedText } from '@/shared/linked-text/LinkedText'
import { MenuCard } from './MenuCard'
import { PLACE_BG } from './place-colors'
import { PLACE_PHOTO_HEIGHT, PlacePhotos } from './PlacePhotos'
import { ShareLinkButton } from './ShareLinkButton'

/** 가장 큰 1단계 높이(2줄 이름·정보 3줄·사진 줄). 장소를 재기 전 첫 높이이자 장소 목록 시트·지도 여백의 기준이다 */
export const PLACE_SHEET_PEEK = 197 + PLACE_PHOTO_HEIGHT

// 1단계 이름의 최대 높이. text-2xl(24) 에 줄 높이 1.2 로 두 줄이다
const TITLE_PEEK_MAX_HEIGHT = 24 * 1.2 * 2

// 1단계를 사진 줄(없으면 정보 줄) 바로 아래에서 끊으려고 더하는 칸들. 손잡이 줄 42, 이름 아래 gap-1.5, 사진 위 gap-2.5, 끝 여백
const SHEET_HANDLE = 42
const TITLE_GAP = 6
const PHOTO_GAP = 10
const PEEK_BOTTOM = 8

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
function PlaceSummary({
  place,
  onPeekHeight,
}: {
  place: MapPlace
  onPeekHeight: (height: number) => void
}) {
  const { sheet, places } = getMessages(useLocale()).map
  const label = placeLabel(place)
  const lang = contentLang(place.language_code)
  const rows = [
    { key: 'host', term: sheet.host, value: place.host_college, lang },
    { key: 'hours', term: sheet.hours, value: placeHours(place) },
    { key: 'location', term: sheet.location, value: label },
  ].filter((row) => row.value)
  const name = place.name ?? places[place.code]
  const peek = useBottomSheetStep() === 'peek'
  // 움직임 줄이기를 켠 사람에게는 이름 칸이 바로 바뀐다
  const reduce = useReducedMotion()
  const titleRef = useRef<HTMLHeadingElement>(null)
  // 잘리지 않은 이름 높이. 1단계 칸은 이 값과 두 줄 중 작은 쪽이라 1줄 이름은 빈 줄 없이 정보가 붙는다
  const [fullHeight, setFullHeight] = useState<number | null>(null)
  useEffect(() => {
    const title = titleRef.current
    if (!title) return
    // 말줄임 중에도 scrollHeight 는 잘린 줄까지 센다. 시트 폭이 바뀌어 줄 수가 달라지면 다시 잰다
    const observer = new ResizeObserver(() => setFullHeight(title.scrollHeight))
    observer.observe(title)
    return () => observer.disconnect()
  }, [name])

  // 정보 줄은 긴 값이 접히면 높아진다. 단계가 바뀌어도 높이가 그대로라 시트가 오르내리는 중에 1단계 목표가 흔들리지 않는다
  const infoRef = useRef<HTMLDListElement>(null)
  const [infoHeight, setInfoHeight] = useState<number | null>(null)
  useEffect(() => {
    const info = infoRef.current
    if (!info) return
    const observer = new ResizeObserver(() => setInfoHeight(info.offsetHeight))
    observer.observe(info)
    return () => observer.disconnect()
  }, [])

  const hasPhotos = (place.place_image_uri?.length ?? 0) > 0
  useEffect(() => {
    if (fullHeight === null || infoHeight === null) return
    const title = Math.min(fullHeight, TITLE_PEEK_MAX_HEIGHT)
    const photos = hasPhotos ? PHOTO_GAP + PLACE_PHOTO_HEIGHT : 0
    onPeekHeight(SHEET_HANDLE + title + TITLE_GAP + infoHeight + photos + PEEK_BOTTOM)
  }, [fullHeight, infoHeight, hasPhotos, onPeekHeight])

  return (
    <div className="flex flex-col gap-1.5 px-2">
      {/* 1단계에선 이름을 2줄까지 보이고 넘치면 자른다. 끝까지 올리면 시트와 같은 스프링으로 늘어나 전부 보인다 */}
      <motion.div
        initial={false}
        animate={{
          height:
            peek && fullHeight !== null ? Math.min(fullHeight, TITLE_PEEK_MAX_HEIGHT) : 'auto',
        }}
        transition={reduce ? { duration: 0 } : SLIDE}
        className="overflow-hidden"
      >
        <BottomSheetTitle
          ref={titleRef}
          lang={lang}
          className={`text-2xl leading-[1.2] font-semibold ${peek ? 'line-clamp-2' : ''}`}
        >
          {/* 번역이 없어 이름이 비면 목록·검색처럼 종류 이름으로 채운다 */}
          {name}
        </BottomSheetTitle>
      </motion.div>
      <div className="flex flex-col gap-2.5">
        <BottomSheetDescription asChild>
          <dl ref={infoRef} className="flex flex-col gap-1 leading-[1.18]">
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
function PlaceDetails({
  place,
  onPeekHeight,
}: {
  place: MapPlace
  onPeekHeight: (height: number) => void
}) {
  const { sheet } = getMessages(useLocale()).map
  return (
    <div className="flex flex-col gap-5">
      <PlaceSummary place={place} onPeekHeight={onPeekHeight} />
      {place.menus.length > 0 && (
        <SheetSection title={sheet.menu}>
          {/* 한 칸이 펼쳐지면 아래 칸들도 같이 재어 밀려 내려가게 묶는다 */}
          <LayoutGroup>
            <ul className="flex flex-col gap-2">
              {place.menus.map((menu) => (
                <MenuCard key={menu.id} menu={menu} />
              ))}
            </ul>
          </LayoutGroup>
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
  // 장소마다 사진 줄(없으면 정보 줄) 아래에서 끊어 소개 글이 1단계에 비치지 않게 한다
  const [peekHeight, setPeekHeight] = useState(PLACE_SHEET_PEEK)

  return (
    <BottomSheet
      open={place !== null}
      hidden={hidden}
      peekHeight={peekHeight}
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
      {current && <PlaceDetails place={current} onPeekHeight={setPeekHeight} />}
    </BottomSheet>
  )
}

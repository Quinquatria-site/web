import { useCallback, useState } from 'react'
import { Tooltip } from 'react-leaflet'
import { useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { CampusMap } from '../map/CampusMap'
import { PlaceMarker } from '../map/PlaceMarker'
import { detailOf } from '../lib/placeText'
import { categoryById } from '../mocks/categories'
import { menusByPlace } from '../mocks/menus'
import { PLACES } from '../mocks/places'
import { placeById, useStoreVersion } from '../mocks/store'
import { findTranslation, type Place } from '../mocks/types'
import { BottomSheet, BottomSheetDescription, BottomSheetTitle, LangBadge, PhotoStrip } from '../ui'
import styles from './PlacesMapRoute.module.css'

const placeName = (place: Place) =>
  findTranslation(place.translations, 'KO')?.name ?? `장소 ${place.id}`

/** 시트 1단계 높이. 손잡이 줄 아래로 이름·종류·번역 뱃지·편집 버튼까지 보인다 */
const PLACE_SHEET_PEEK = 197

/** 메뉴가 없는 게 정상인 카테고리. "메뉴 0개" 는 잘못을 알리는 것처럼 읽힌다 */
const MENULESS = new Set(['MEDI', 'BRACELET'])

// 1단계에는 이름·종류·뱃지·편집 버튼만 두고, 끌어 올리면 설명·메뉴·사진이 이어진다
function PlaceSheetBody({ place }: { place: Place }) {
  const navigate = useNavigate()
  const code = categoryById(place.category_id)?.code ?? 'BOOTH'
  const description = findTranslation(place.translations, 'KO')?.description
  const menuCount = menusByPlace(place.id).length

  return (
    <>
      <BottomSheetTitle className={styles.title}>{placeName(place)}</BottomSheetTitle>
      <BottomSheetDescription className={styles.detail}>{detailOf(place)}</BottomSheetDescription>
      <div className={styles.badges}>
        <LangBadge translations={place.translations} />
      </div>
      <ActionButton
        className={styles.edit}
        size="medium"
        onClick={() => navigate(`/places/${place.id}`)}
      >
        편집하기
      </ActionButton>
      {description && <p className={styles.description}>{description}</p>}
      {!MENULESS.has(code) && <p className={styles.meta}>메뉴 {menuCount}개</p>}
      <PhotoStrip
        className={styles.photos}
        uris={place.place_image_uri}
        label={placeName(place)}
        size="small"
      />
    </>
  )
}

/**
 * 전체 지도. 장소를 user 지도와 같은 마커(카테고리 색·구역 글자·아이콘)로 보여주고,
 * 누르면 user 와 같은 두 단계 바텀시트로 정보를 편다. 운영자가 학생 화면과 같은 모양으로 확인한다.
 */
export function PlacesMapRoute() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [focusRequest, setFocusRequest] = useState(0)
  const [dragging, setDragging] = useState(false)

  // 편집·삭제가 지도와 시트에 바로 반영되게 한다
  useStoreVersion()
  // 객체가 아니라 id 로 들고 있는다. 목 스토어는 배열을 제자리에서 바꾸고 지우기까지
  // 해서(store.ts deletePlace), 객체를 쥐고 있으면 시트가 옛 값을 계속 보여준다
  const selected = (selectedId === null ? undefined : placeById(selectedId)) ?? null

  // 닫히며 내려가는 동안에도 내용이 남아 있게 마지막 장소를 쥐고 있는다
  const [shown, setShown] = useState(selected)
  if (selected && selected !== shown) setShown(selected)
  const current = selected ?? shown

  const select = useCallback((id: number) => {
    setSelectedId(id)
    setFocusRequest((n) => n + 1)
  }, [])
  const close = useCallback(() => setSelectedId(null), [])

  return (
    <div className={styles.screen}>
      <CampusMap
        className={styles.map}
        onBackgroundClick={close}
        focus={selected}
        focusRequest={focusRequest}
        bottomInset={PLACE_SHEET_PEEK}
        onDragChange={setDragging}
      >
        {PLACES.map((place) => {
          const code = categoryById(place.category_id)?.code ?? 'BOOTH'
          return (
            <PlaceMarker
              key={place.id}
              point={place}
              code={code}
              sequence={place.category_sequence}
              selected={place.id === selectedId}
              onSelect={() => select(place.id)}
            >
              <Tooltip direction="top" offset={[0, -12]}>
                {placeName(place)} · {place.category_sequence}
              </Tooltip>
            </PlaceMarker>
          )
        })}
      </CampusMap>

      <BottomSheet
        open={selected !== null}
        onClose={close}
        hidden={dragging}
        peekHeight={PLACE_SHEET_PEEK}
      >
        {current && <PlaceSheetBody place={current} />}
      </BottomSheet>
    </div>
  )
}

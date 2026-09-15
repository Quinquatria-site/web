import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { CircleMarker, Tooltip } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import { useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { CampusMap } from '../map/CampusMap'
import { fromSource, toLatLng } from '../map/campus'
import { CATEGORY_COLORS } from '../map/category-colors'
import { detailOf } from '../lib/placeText'
import { categoryById } from '../mocks/categories'
import { menusByPlace } from '../mocks/menus'
import { PLACES } from '../mocks/places'
import { placeById, useStoreVersion } from '../mocks/store'
import { findTranslation, type Place } from '../mocks/types'
import { LangBadge, PhotoStrip, Sheet } from '../ui'
import styles from './PlacesMapRoute.module.css'

const placeName = (place: Place) =>
  findTranslation(place.translations, 'KO')?.name ?? `장소 ${place.id}`

/** 시트가 아무리 커도 지도를 이만큼은 남긴다 */
const MIN_MAP_HEIGHT = 160

/** 메뉴가 없는 게 정상인 카테고리. "메뉴 0개" 는 잘못을 알리는 것처럼 읽힌다 */
const MENULESS = new Set(['MEDI', 'BRACELET'])

function PlaceSheetBody({ place }: { place: Place }) {
  const navigate = useNavigate()
  const code = categoryById(place.category_id)?.code ?? 'BOOTH'
  const description = findTranslation(place.translations, 'KO')?.description
  const menuCount = menusByPlace(place.id).length

  return (
    <>
      {/* 시트는 지도를 가리므로 배너 대신 작은 줄로 둔다 */}
      <PhotoStrip
        className={styles.photos}
        uris={place.place_image_uri}
        label={placeName(place)}
        size="small"
      />
      <p className={styles.detail}>{detailOf(place)}</p>
      <div className={styles.badges}>
        <LangBadge translations={place.translations} />
      </div>
      {description && <p className={styles.description}>{description}</p>}
      {!MENULESS.has(code) && <p className={styles.meta}>메뉴 {menuCount}개</p>}
      <ActionButton
        className={styles.edit}
        size="medium"
        onClick={() => navigate(`/places/${place.id}`)}
      >
        편집하기
      </ActionButton>
    </>
  )
}

/**
 * 전체 지도. 목 장소를 카테고리 색 원 마커로 보여주고, 누르면 시트로 정보를 편다.
 * 마커 아이콘 이미지 대신 CircleMarker(SVG)를 쓴다 — leaflet 기본 아이콘의
 * 번들 경로 문제를 피하고, 색만으로 카테고리를 구분하기에 충분하다.
 */
export function PlacesMapRoute() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [map, setMap] = useState<LeafletMap | null>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  // 시트가 덮는 높이. 지도 영역에서 이만큼을 뺀다
  const [inset, setInset] = useState(0)

  // 편집·삭제가 지도와 시트에 바로 반영되게 한다
  useStoreVersion()
  // 객체가 아니라 id 로 들고 있는다. 목 스토어는 배열을 제자리에서 바꾸고 지우기까지
  // 해서(store.ts deletePlace), 객체를 쥐고 있으면 시트가 옛 값을 계속 보여준다
  const selected = selectedId === null ? undefined : placeById(selectedId)

  const close = useCallback(() => setSelectedId(null), [])

  /*
   * 시트 높이를 잰다. 내용마다 다르고(사진 유무·설명 줄바꿈·메뉴 줄) 사진이 늦게
   * 로드되면서도 바뀌므로, 한 번 재고 마는 대신 ResizeObserver 로 따라간다.
   */
  useLayoutEffect(() => {
    const sheet = sheetRef.current
    const screen = screenRef.current
    if (!sheet || !screen) return

    const measure = () => {
      if (!selected) return setInset(0)
      // 시트가 아무리 커도 지도가 사라지지는 않게 한다
      const cap = Math.max(0, screen.clientHeight - MIN_MAP_HEIGHT)
      setInset(Math.min(sheet.offsetHeight, cap))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(sheet)
    observer.observe(screen)
    return () => observer.disconnect()
  }, [selected])

  /*
   * 줄어든 영역을 Leaflet 에 알리고, 고른 마커를 그 가운데로 옮긴다.
   *
   * 지도 "내용" 을 미는 panBy 로는 안 된다 — _limitCenter 가 getSize() 로 경계를
   * 재서, 이미지가 뷰포트보다 작으면 중심이 고정돼 한 픽셀도 안 움직인다.
   * 컨테이너를 줄이면 그 getSize() 가 작아져 움직일 여지가 생긴다. 덤으로 지도
   * 영역이 시트 구역을 아예 제외하므로 마커가 시트 뒤로 숨는 일 자체가 없어진다.
   */
  useLayoutEffect(() => {
    if (!map) return
    // pan: false — 어디로 옮길지는 아래에서 우리가 정한다
    map.invalidateSize({ pan: false })

    const place = selectedId === null ? undefined : placeById(selectedId)
    if (!place) {
      // 닫혀서 영역이 넓어졌다. setView 를 한 번 태워 maxBounds 안으로 되돌린다
      map.setView(map.getCenter(), map.getZoom())
      return
    }
    // 줌은 그대로 둔다. 운영자가 맞춰둔 배율을 건드리지 않는다
    map.setView(toLatLng(fromSource({ x: place.x, y: place.y })), map.getZoom(), {
      animate: true,
    })
  }, [map, inset, selectedId])

  return (
    <div
      ref={screenRef}
      className={styles.screen}
      style={{ '--sheet-inset': `${inset}px` } as CSSProperties}
    >
      <CampusMap className={styles.map} onBackgroundClick={close} onMapReady={setMap}>
        {PLACES.map((place) => {
          const code = categoryById(place.category_id)?.code ?? 'BOOTH'
          const active = place.id === selectedId
          return (
            <CircleMarker
              key={place.id}
              center={toLatLng(fromSource({ x: place.x, y: place.y }))}
              radius={active ? 12 : 9}
              pathOptions={{
                color: '#FFFFFF',
                weight: active ? 3 : 2,
                fillColor: CATEGORY_COLORS[code],
                fillOpacity: 0.95,
                // Path 는 기본으로 지도까지 클릭을 올려보낸다. 끊지 않으면 시트가
                // 열리자마자 배경 클릭으로 닫힌다
                bubblingMouseEvents: false,
              }}
              eventHandlers={{ click: () => setSelectedId(place.id) }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {placeName(place)} · {place.category_sequence}
              </Tooltip>
            </CircleMarker>
          )
        })}
      </CampusMap>

      <Sheet
        ref={sheetRef}
        open={Boolean(selected)}
        onClose={close}
        title={selected ? placeName(selected) : ''}
      >
        {selected && <PlaceSheetBody place={selected} />}
      </Sheet>
    </div>
  )
}

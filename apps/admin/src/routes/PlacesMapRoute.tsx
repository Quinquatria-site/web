import { CircleMarker, Tooltip } from 'react-leaflet'
import { CampusMap } from '../map/CampusMap'
import { fromSource, toLatLng } from '../map/campus'
import { CATEGORY_COLORS } from '../map/category-colors'
import { categoryById } from '../mocks/categories'
import { PLACES } from '../mocks/places'
import { findTranslation } from '../mocks/types'
import styles from './PlacesMapRoute.module.css'

/**
 * 전체 지도. 목 장소를 카테고리 색 원 마커로 보여준다.
 * 마커 아이콘 이미지 대신 CircleMarker(SVG)를 쓴다 — leaflet 기본 아이콘의
 * 번들 경로 문제를 피하고, 색만으로 카테고리를 구분하기에 충분하다.
 */
export function PlacesMapRoute() {
  return (
    <div className={styles.screen}>
      <CampusMap className={styles.map}>
        {PLACES.map((place) => {
          const code = categoryById(place.category_id)?.code ?? 'BOOTH'
          const name = findTranslation(place.translations, 'KO')?.name ?? `장소 ${place.id}`
          return (
            <CircleMarker
              key={place.id}
              center={toLatLng(fromSource({ x: place.x, y: place.y }))}
              radius={9}
              pathOptions={{
                color: '#FFFFFF',
                weight: 2,
                fillColor: CATEGORY_COLORS[code],
                fillOpacity: 0.95,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {name} · {place.category_sequence}
              </Tooltip>
            </CircleMarker>
          )
        })}
      </CampusMap>
    </div>
  )
}

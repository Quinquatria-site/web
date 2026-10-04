import { useMemo } from 'react'
import { CircleMarker, Polygon, Polyline } from 'react-leaflet'
import { toLatLng, type Point } from './campus'
import { CATEGORY_COLORS } from './category-colors'
import type { PlaceCode } from './place-label'

/** 편집 중인 구역. 찍은 꼭짓점을 점으로, 3개부터는 저장될 모양 그대로 칠해 보여 준다. 누름은 모두 지도로 흘려 다음 꼭짓점을 찍게 한다 */
export function AreaDraft({ vertices, code }: { vertices: Point[]; code: PlaceCode }) {
  const positions = useMemo(() => vertices.map(toLatLng), [vertices])
  const color = CATEGORY_COLORS[code]

  return (
    <>
      {positions.length >= 3 ? (
        <Polygon
          positions={positions}
          pathOptions={{ color, fillColor: color, weight: 2, dashArray: '6 4', fillOpacity: 0.3 }}
          interactive={false}
        />
      ) : (
        positions.length === 2 && (
          <Polyline
            positions={positions}
            pathOptions={{ color, weight: 2, dashArray: '6 4' }}
            interactive={false}
          />
        )
      )}
      {positions.map((position, index) => (
        <CircleMarker
          // 꼭짓점은 끝에서만 붙고 빠져 순서가 곧 구분값이다
          key={index}
          center={position}
          radius={5}
          pathOptions={{ color, weight: 2, fillColor: '#fff', fillOpacity: 1 }}
          interactive={false}
        />
      ))}
    </>
  )
}

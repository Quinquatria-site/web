import type { PathOptions } from 'leaflet'
import { memo, useMemo } from 'react'
import { Polygon, Tooltip } from 'react-leaflet'
import { toLatLng, type Point } from './campus'
import { CATEGORY_COLORS } from './category-colors'
import type { PlaceCode } from './place-label'

interface PlaceAreaProps {
  area: Point[]
  code: PlaceCode
  selected?: boolean
  /** onSelect 에 돌려줄 장소 id */
  id?: number
  /** 없으면 누를 수 없는 구역이 되어 누름이 지도로 간다 */
  onSelect?: (id: number) => void
  /** 마우스를 올리면 띄울 글 */
  tooltip?: string
  /** 반투명하게 깐다. 좌표 픽커에서 다른 장소를 참고로 보여 줄 때 */
  faded?: boolean
}

/** 점 대신 구역으로 표시하는 장소. user 앱 PlaceArea 와 같은 채움 30% · 점선 2 이고, 고르면 진하게 칠한다 */
export const PlaceArea = memo(function PlaceArea({
  area,
  code,
  selected = false,
  id,
  onSelect,
  tooltip,
  faded = false,
}: PlaceAreaProps) {
  const positions = useMemo(() => area.map(toLatLng), [area])
  const color = CATEGORY_COLORS[code]
  const selectable = Boolean(onSelect)
  const pathOptions: PathOptions = {
    color,
    fillColor: color,
    weight: selected ? 3 : 2,
    dashArray: '6 4',
    lineJoin: 'round',
    opacity: faded ? 0.5 : 1,
    fillOpacity: faded ? 0.15 : selected ? 0.5 : 0.3,
  }
  const eventHandlers = useMemo(
    () => ({
      click: () => {
        if (id !== undefined) onSelect?.(id)
      },
    }),
    [id, onSelect],
  )

  return (
    // interactive · bubblingMouseEvents 는 만들 때만 읽는다. 누를 수 없는 구역은 누름을 지도로 올려 좌표 픽커가 받게 한다
    <Polygon
      positions={positions}
      pathOptions={pathOptions}
      interactive={selectable || Boolean(tooltip)}
      bubblingMouseEvents={!selectable}
      eventHandlers={eventHandlers}
    >
      {tooltip && <Tooltip sticky>{tooltip}</Tooltip>}
    </Polygon>
  )
})

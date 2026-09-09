import { preload } from 'react-dom'
import { PageHeader } from '@/components/page-header'
import { CampusMapLoader } from '@/domains/map/components/campus-map-loader'
import { IMAGE_URL } from '@/domains/map/libs/campus'

export default function Page() {
  // Leaflet 청크를 기다리지 않고 도면부터 내려받게 한다.
  preload(IMAGE_URL, { as: 'image', fetchPriority: 'high' })

  return (
    <div className="flex h-full flex-col">
      <PageHeader path="/map" />
      {/* 헤더가 쓰고 남은 높이를 도면이 채운다. min-h-0 이 없으면 지도가 헤더를 밀어낸다 */}
      <div className="min-h-0 flex-1">
        <CampusMapLoader />
      </div>
    </div>
  )
}

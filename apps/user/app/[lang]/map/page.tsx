import { preload } from 'react-dom'
import { CampusMapLoader } from '@/domains/map/components/campus-map-loader'
import { IMAGE_URL } from '@/domains/map/libs/campus'

export default function Page() {
  // Leaflet 청크를 기다리지 않고 도면부터 내려받게 한다.
  preload(IMAGE_URL, { as: 'image', fetchPriority: 'high' })

  return (
    <div className="h-full">
      <CampusMapLoader />
    </div>
  )
}

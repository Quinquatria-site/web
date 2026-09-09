'use client'

import dynamic from 'next/dynamic'
import { MapLoading } from './map-loading'

// Leaflet 은 window 를 쓰므로 서버 렌더링을 끄고 브라우저에서만 불러온다.
const CampusMap = dynamic(() => import('./campus-map').then((m) => m.CampusMap), {
  ssr: false,
  loading: () => <MapLoading />,
})

export function CampusMapLoader() {
  return (
    <div className="relative h-full w-full">
      <CampusMap />
    </div>
  )
}

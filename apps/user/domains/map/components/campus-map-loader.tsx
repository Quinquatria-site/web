'use client'

import dynamic from 'next/dynamic'
import { MapLoading } from './map-loading'

// Leaflet 은 window 를 쓰므로 서버 렌더링을 끄고 브라우저에서만 불러온다.
const CampusMap = dynamic(() => import('./campus-map').then((m) => m.CampusMap), {
  ssr: false,
  // CampusMap 의 로더와 같은 이유로 여기서도 상자를 만들어 가둔다.
  loading: () => (
    <div className="relative isolate h-full w-full">
      <MapLoading />
    </div>
  ),
})

export function CampusMapLoader() {
  return (
    <div className="relative h-full w-full">
      <CampusMap />
    </div>
  )
}

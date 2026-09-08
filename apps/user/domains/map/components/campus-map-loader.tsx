'use client'

import dynamic from 'next/dynamic'

// Leaflet 은 window 를 쓰므로 서버 렌더링을 끄고 브라우저에서만 불러온다.
const CampusMap = dynamic(() => import('./campus-map').then((m) => m.CampusMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface" />,
})

export function CampusMapLoader() {
  return <CampusMap />
}

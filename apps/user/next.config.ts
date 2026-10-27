import type { NextConfig } from 'next'
import { API_TRAP_SOURCE, FOCUS_PATH, TRAP_SOURCE } from './features/focus/trap-paths'
import { DEFAULT_LOCALE } from './shared/i18n/locales'

const nextConfig: NextConfig = {
  // Hobby 플랜의 이미지 최적화 한도를 넘겨 /_next/image 가 402 라, 변환 없이 원본 파일을 그대로 준다
  images: { unoptimized: true },
  // 루트 레이아웃이 언어 칸 아래라 `/` 에는 그릴 화면이 없다
  async redirects() {
    return [
      { source: '/', destination: `/${DEFAULT_LOCALE}`, permanent: false },
      { source: TRAP_SOURCE, destination: FOCUS_PATH, permanent: false },
      { source: API_TRAP_SOURCE, destination: FOCUS_PATH, permanent: false },
    ]
  },
  // 아카이브라 public 사진·영상이 바뀌지 않아, 다시 방문해도 서버에 묻지 않게 한다. 바꿀 일이 생기면 파일 이름을 바꾼다
  async headers() {
    const immutable = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }]
    return [
      { source: '/images/:path*', headers: immutable },
      { source: '/:file([^/]+\\.(?:webp|jpg|mp4))', headers: immutable },
    ]
  },
}

export default nextConfig

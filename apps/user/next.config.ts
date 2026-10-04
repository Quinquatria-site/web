import type { NextConfig } from 'next'
import { API_TRAP_SOURCE, FOCUS_PATH, TRAP_SOURCE } from './features/focus/trap-paths'
import { DEFAULT_LOCALE } from './shared/i18n/locales'
import { ASSET_BASE } from './shared/photo/asset-url'

const nextConfig: NextConfig = {
  // API 사진은 S3 key 라 shared/photo/asset-url 이 이 origin 을 붙인다. 허용하지 않으면 /_next/image 가 400
  images: { remotePatterns: [new URL(`${ASSET_BASE}/**`)] },
  // 루트 레이아웃이 언어 칸 아래라 `/` 에는 그릴 화면이 없다
  async redirects() {
    return [
      { source: '/', destination: `/${DEFAULT_LOCALE}`, permanent: false },
      { source: TRAP_SOURCE, destination: FOCUS_PATH, permanent: false },
      { source: API_TRAP_SOURCE, destination: FOCUS_PATH, permanent: false },
    ]
  },
}

export default nextConfig

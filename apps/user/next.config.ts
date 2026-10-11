import type { NextConfig } from 'next'
import { API_TRAP_SOURCE, FOCUS_PATH, TRAP_SOURCE } from './features/focus/trap-paths'
import { DEFAULT_LOCALE } from './shared/i18n/locales'
import { REMOTE_ASSET_BASE } from './shared/photo/asset-url'

const nextConfig: NextConfig = {
  // 분실물 사진만 S3 에서 받는다. 허용하지 않으면 /_next/image 가 400
  images: { remotePatterns: [new URL(`${REMOTE_ASSET_BASE}/**`)] },
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

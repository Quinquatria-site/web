import type { NextConfig } from 'next'
import { DEFAULT_LOCALE } from './shared/i18n/locales'

const nextConfig: NextConfig = {
  // 루트 레이아웃이 언어 칸 아래라 `/` 에는 그릴 화면이 없다
  async redirects() {
    return [{ source: '/', destination: `/${DEFAULT_LOCALE}`, permanent: false }]
  },
}

export default nextConfig

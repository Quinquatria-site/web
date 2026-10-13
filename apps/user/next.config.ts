import type { NextConfig } from 'next'
import { API_TRAP_SOURCE, FOCUS_PATH, TRAP_SOURCE } from './features/focus/trap-paths'
import { DEFAULT_LOCALE } from './shared/i18n/locales'

const nextConfig: NextConfig = {
  // Hobby 플랜의 이미지 최적화 한도를 넘겨 /_next/image 가 402 라, 변환 없이 원본 파일을 그대로 준다
  // 분실물 사진도 S3 주소를 그대로 받아 remotePatterns 가 필요 없다
  images: { unoptimized: true },
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

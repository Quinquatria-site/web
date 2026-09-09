import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['172.30.1.45', '100.89.31.11'],
  // 언어 없는 '/' 는 기본 언어로 보낸다. 라우트를 만들지 않아 정적 빌드가 그대로다.
  async redirects() {
    return [{ source: '/', destination: '/ko', permanent: false }]
  },
}

export default nextConfig

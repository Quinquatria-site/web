import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // next dev 가 AI 에이전트를 감지하면 AGENTS.md · CLAUDE.md 를 만든다. 만들지 않는다.
  agentRules: false,
  allowedDevOrigins: ['172.30.1.45', '100.89.31.11'],
  // 언어 없는 '/' 는 기본 언어로 보낸다. 라우트를 만들지 않아 정적 빌드가 그대로다.
  async redirects() {
    return [
      { source: '/', destination: '/ko', permanent: false },
      // 언어 없이 문을 두드린 사람도 같은 화면을 본다.
      { source: '/admin', destination: '/ko/admin', permanent: false },
    ]
  },
}

export default nextConfig

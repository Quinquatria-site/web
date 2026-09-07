import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ['10.*.*.*', '172.16.*.*', '192.168.*.*'],
}

export default nextConfig

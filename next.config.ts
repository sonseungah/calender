import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'nng-phinf.pstatic.net' }, // 치지직 프로필 이미지
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig

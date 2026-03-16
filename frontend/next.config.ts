import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Server Actions のボディサイズ上限を 6MB に設定（プロフィール画像アップロード用）
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        // S3バケットのホスト名（写真ストレージ移行時のために追加）
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

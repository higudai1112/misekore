import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // www.misekore.com → misekore.com へ 301 リダイレクト（OGP・SEO統一のため）
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.misekore.com' }],
        destination: 'https://misekore.com/:path*',
        permanent: true,
      },
    ]
  },
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

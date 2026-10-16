import type { NextConfig } from 'next';

const apiInternalUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:3333';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    proxyTimeout: 90_000,
    proxyClientMaxBodySize: '12mb',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiInternalUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

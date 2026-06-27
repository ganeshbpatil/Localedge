import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@localedge/shared', '@localedge/ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudflare.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;

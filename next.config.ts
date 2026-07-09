import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
    webpackMemoryOptimizations: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  webpack: (config, { webpack }) => {
    const envs: Record<string, string | undefined> = {};
    for (const key in process.env) {
      if (key.startsWith('VITE_')) {
        envs[key] = process.env[key];
      }
    }
    config.plugins.push(
      new webpack.DefinePlugin({
        'import.meta.env': JSON.stringify(envs),
      })
    );
    return config;
  },
};

export default nextConfig;

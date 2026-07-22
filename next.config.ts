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
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com https://*.firebaseio.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://vitals.vercel-insights.com https://*.vercel-insights.com https://cdn.jsdelivr.net",
      "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com https://*.firebaseio.com https://va.vercel-scripts.com https://*.vercel-scripts.com https://vitals.vercel-insights.com https://*.vercel-insights.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' blob: data: https://*.googleusercontent.com https://*.firebaseusercontent.com https://images.unsplash.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.googleapis.com wss://*.firebaseio.com https://*.firebaseio.com wss://*.firebasedatabase.app https://*.firebasedatabase.app https://*.firebase.google.com https://formsubmit.co https://vitals.vercel-insights.com https://*.vercel-insights.com https://*.vercel-scripts.com",
      "worker-src 'self' blob: https://*.firebaseapp.com",
      "frame-src 'self' https://*.firebaseapp.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
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

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

      // Scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://apis.google.com https://www.gstatic.com https://*.gstatic.com https://www.googleapis.com https://*.googleapis.com https://accounts.google.com https://www.google.com https://*.google.com https://www.gstatic.com/firebasejs/ https://www.gstatic.com/recaptcha/ https://www.gstatic.com/recaptcha/releases/ https://recaptcha.net https://*.recaptcha.net https://va.vercel-scripts.com https://*.vercel-scripts.com https://vitals.vercel-insights.com https://*.vercel-insights.com https://vercel.live https://*.vercel.app https://cdn.jsdelivr.net https://moncampus.online https://*.moncampus.online",

      // Scripts chargés via balises <script>
      "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' blob: https://apis.google.com https://www.gstatic.com https://*.gstatic.com https://www.googleapis.com https://*.googleapis.com https://accounts.google.com https://www.google.com https://*.google.com https://www.gstatic.com/firebasejs/ https://www.gstatic.com/recaptcha/ https://www.gstatic.com/recaptcha/releases/ https://recaptcha.net https://*.recaptcha.net https://va.vercel-scripts.com https://*.vercel-scripts.com https://vitals.vercel-insights.com https://*.vercel-insights.com https://vercel.live https://*.vercel.app https://cdn.jsdelivr.net https://moncampus.online https://*.moncampus.online",

      // Styles
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com https://*.gstatic.com https://ssl.gstatic.com https://moncampus.online https://*.moncampus.online",

      // Images
      "img-src 'self' blob: data: https://*.googleusercontent.com https://*.firebaseusercontent.com https://images.unsplash.com https://www.gstatic.com https://*.gstatic.com https://ssl.gstatic.com https://www.google.com https://*.google.com https://*.firebasestorage.app https://*.firebaseapp.com https://firebaseapp.com",

      // Polices
      "font-src 'self' https://fonts.gstatic.com https://*.gstatic.com data:",

      // Requêtes réseau
      "connect-src 'self' https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google.com https://*.google.com https://*.gstatic.com wss://*.firebaseio.com https://*.firebaseio.com https://firebaseio.com wss://*.firebasedatabase.app https://*.firebasedatabase.app https://*.firebase.google.com https://*.firebaseapp.com https://firebaseapp.com https://recaptcha.net https://*.recaptcha.net https://formsubmit.co https://vitals.vercel-insights.com https://*.vercel-insights.com https://*.vercel-scripts.com https://vercel.live https://*.vercel.app wss://*.vercel.live https://moncampus.online https://*.moncampus.online wss://moncampus.online wss://*.moncampus.online",

      // Web workers
      "worker-src 'self' blob: https://*.firebaseapp.com https://firebaseapp.com https://*.google.com https://*.googleapis.com https://moncampus.online https://*.moncampus.online",

      // Iframes
      "frame-src 'self' https://*.firebaseapp.com https://firebaseapp.com https://accounts.google.com https://www.google.com https://*.google.com https://recaptcha.net https://*.recaptcha.net https://vercel.live https://moncampus.online https://*.moncampus.online",

      // Sécurité supplémentaire
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
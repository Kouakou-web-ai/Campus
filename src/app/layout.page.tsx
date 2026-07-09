import type { Metadata, Viewport } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Campus - Espace Universitaire',
  description: 'Plateforme Universitaire Premium',
  authors: [{ name: 'Kouakou Atsé Mondésire' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/images/logo-original.png',
    apple: '/images/logo-original.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#863bff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var key = 'campus-theme';
                var stored = localStorage.getItem(key);
                var mode = 'light';
                try {
                  var parsed = stored ? JSON.parse(stored) : null;
                  var saved = parsed && parsed.state && parsed.state.mode ? parsed.state.mode : 'light';
                  mode = saved === 'dark' ? 'dark' : 'light';
                } catch (e) {}
                var theme = mode === 'dark' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.style.colorScheme = theme;
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
        {/*
          Script anti-bot retiré : il testait navigator.webdriver, window.domAutomation,
          window._phantom, etc. et effaçait toute la page si détecté. Problème : l'outil
          de capture d'écran de Vercel (et vos propres tests Playwright/Puppeteer) utilisent
          justement un navigateur "webdriver", donc ce script bloquait aussi le déploiement
          de production sur Vercel lui-même. Si une protection anti-scraping est vraiment
          nécessaire plus tard, mieux vaut la faire côté serveur (middleware) avec une
          whitelist explicite pour les IPs/UA de Vercel, plutôt que côté client de façon
          aussi radicale.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                    navigator.serviceWorker.getRegistrations().then(regs => {
                      regs.forEach(reg => reg.unregister());
                    });
                  } else {
                    navigator.serviceWorker.register('/sw.js')
                      .then(reg => console.log('PWA Service Worker enregistré :', reg.scope))
                      .catch(err => console.error('Erreur d\\'enregistrement du Service Worker :', err));
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="bg-app text-content antialiased min-h-screen transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
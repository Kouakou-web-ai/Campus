import type { Metadata } from 'next';
import Providers from './providers';
import '../index.css';

export const metadata: Metadata = {
  title: 'Campus - Plateforme Universitaire',
  description: 'Plateforme Universitaire Premium',
};

const themeScript = `
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
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/images/logo-original.png" />
        <link rel="apple-touch-icon" href="/images/logo-original.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#863bff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-app text-content antialiased min-h-screen transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

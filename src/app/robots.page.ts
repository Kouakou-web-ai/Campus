import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/admin/',
        '/super-admin/',
        '/enseignant/',
        '/etudiant/',
        '/parent/',
        '/app/',
        '/api/',
        '/account-pending',
        '/account-rejected',
        '/account-suspended',
      ],
    },
    sitemap: 'https://www.moncampus.online/sitemap.xml',
  };
}

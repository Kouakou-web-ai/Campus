import { NextResponse } from 'next/server';

export function GET() {
  const baseUrl = 'https://www.moncampus.online';
  const pages = [
    { url: '', changeFreq: 'daily', priority: '1.0' },
    { url: '/tarifs', changeFreq: 'weekly', priority: '0.8' },
    { url: '/faq', changeFreq: 'weekly', priority: '0.8' },
    { url: '/contact', changeFreq: 'weekly', priority: '0.8' },
    { url: '/conditions', changeFreq: 'monthly', priority: '0.3' },
    { url: '/mentions-legales', changeFreq: 'monthly', priority: '0.3' },
    { url: '/confidentialite', changeFreq: 'monthly', priority: '0.3' },
    { url: '/signup', changeFreq: 'monthly', priority: '0.6' },
    { url: '/connexion', changeFreq: 'monthly', priority: '0.6' },
    { url: '/activation-compte', changeFreq: 'monthly', priority: '0.3' },
  ];

  const lastmod = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

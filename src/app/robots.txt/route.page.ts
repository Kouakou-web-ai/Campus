import { NextResponse } from 'next/server';

export function GET() {
  const robotsText = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /super-admin/
Disallow: /enseignant/
Disallow: /etudiant/
Disallow: /parent/
Disallow: /app/
Disallow: /api/
Disallow: /account-pending
Disallow: /account-rejected
Disallow: /account-suspended

Sitemap: https://www.moncampus.online/sitemap.xml`;

  return new NextResponse(robotsText, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}

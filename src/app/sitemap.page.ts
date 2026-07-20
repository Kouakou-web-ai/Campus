import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.moncampus.online';
  const pages = [
    { url: '', changeFreq: 'daily', priority: 1.0 },
    { url: '/tarifs', changeFreq: 'weekly', priority: 0.8 },
    { url: '/faq', changeFreq: 'weekly', priority: 0.8 },
    { url: '/contact', changeFreq: 'weekly', priority: 0.8 },
    { url: '/conditions', changeFreq: 'monthly', priority: 0.3 },
    { url: '/mentions-legales', changeFreq: 'monthly', priority: 0.3 },
    { url: '/confidentialite', changeFreq: 'monthly', priority: 0.3 },
    { url: '/signup', changeFreq: 'monthly', priority: 0.6 },
    { url: '/connexion', changeFreq: 'monthly', priority: 0.6 },
    { url: '/activation-compte', changeFreq: 'monthly', priority: 0.3 },
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFreq as 'daily' | 'weekly' | 'monthly',
    priority: page.priority,
  }));
}

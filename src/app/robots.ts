import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin console and API routes are private plumbing, not content.
      disallow: ['/admin', '/api'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

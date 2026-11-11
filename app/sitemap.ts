import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = await siteUrl();
  return [
    { url: `${url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${url}/termos`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${url}/privacidade`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}

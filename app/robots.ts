import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';

// Os buscadores podem ver o site; o painel e a API ficam de fora.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const url = await siteUrl();
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/painel', '/api/'] }], sitemap: `${url}/sitemap.xml`, host: url };
}

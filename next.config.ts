import type { NextConfig } from 'next';

const producao = process.env.NODE_ENV === 'production';

// Política de conteúdo: o site só carrega o que precisa. O vídeo da página inicial (Supabase Storage) e o
// mapa do Google (seção "Como chegar") são os únicos de fora. 'unsafe-inline' é necessário para os scripts
// que o próprio Next coloca na página; não há eval nem código de terceiros.
// Se mudar o endereço do vídeo (VIDEO_HOME em lib/site-data.ts), mude também o endereço abaixo.
const SUPABASE = 'https://eocpwpvxcxtnjcydloeu.supabase.co';
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  `media-src 'self' ${SUPABASE}`,
  'frame-src https://www.google.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // não anuncia qual sistema roda por trás
  output: 'standalone',
  serverExternalPackages: ['web-push'], // usa recursos do Node que não devem ser empacotados
  async headers() {
    return [
      // O service worker nunca fica em cache: uma versão nova vale na hora
      { source: '/sw-painel.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=15552000' },
          ...(producao ? [{ key: 'Content-Security-Policy', value: csp }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;

import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { SemZoom } from '@/components/SemZoom';
import { LOCAL, SITE_INFO, VIDEO_HOME } from '@/lib/site-data';
import { siteUrl } from '@/lib/site-url';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Tela do tamanho do aparelho e sem zoom automático ao tocar nos campos (principalmente no Safari do iPhone).
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false };

const TITULO = 'Sítio Shalom Xerém | Retiros Espirituais & Eventos Cristãos';
const DESCRICAO =
  'Estrutura completa e exclusiva para igrejas, retiros espirituais, acampamentos, congressos e encontros de casais no Sítio Shalom Xerém. Acomodação para até 150 pessoas cercada pela natureza.';
const IMAGEM = { url: '/brand/og.jpg', width: 1200, height: 630, alt: 'Logo do Sítio Shalom Xerém: casa, serra e palmeira ao pôr do sol' };

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(await siteUrl()),
    title: TITULO,
    description: DESCRICAO,
    alternates: { canonical: '/' },
    openGraph: { title: TITULO, description: DESCRICAO, type: 'website', locale: 'pt_BR', siteName: SITE_INFO.name, url: '/', images: [IMAGEM] },
    twitter: { card: 'summary_large_image', title: TITULO, description: DESCRICAO, images: [IMAGEM.url] },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const url = await siteUrl();
  // Dados para o Google mostrar o negócio (nome, endereço, telefone) nos resultados e no mapa.
  const negocio = {
    '@context': 'https://schema.org',
    '@type': ['LodgingBusiness', 'EventVenue'],
    name: SITE_INFO.name,
    description: DESCRICAO,
    url,
    image: `${url}/brand/og.jpg`,
    telephone: '+' + SITE_INFO.whatsappNumber,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Estrada São Lourenço, 3897',
      addressLocality: 'Xerém, Duque de Caxias',
      addressRegion: LOCAL.estado,
      addressCountry: 'BR',
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCAL.endereco)}`,
    maximumAttendeeCapacity: SITE_INFO.maxCapacity,
  };
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="preconnect" href={VIDEO_HOME.origem} />
      </head>
      <body className="bg-[#FAF8F5] text-[#1C1917] antialiased selection:bg-[#1B4332] selection:text-white" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(negocio).replace(/</g, '\\u003c') }} />
        <SemZoom />
        {children}
      </body>
    </html>
  );
}


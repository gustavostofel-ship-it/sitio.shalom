import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { SemZoom } from '@/components/SemZoom';

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

export const metadata: Metadata = {
  title: 'Sítio Shalom Xerém | Retiros Espirituais & Eventos Cristãos',
  description: 'Estrutura completa e exclusiva para igrejas, retiros espirituais, acampamentos, congressos e encontros de casais no Sítio Shalom Xerém. Acomodação para até 150 pessoas cercada pela natureza.',
  openGraph: {
    title: 'Sítio Shalom Xerém | Retiros Espirituais & Eventos Cristãos',
    description: 'Estrutura completa e exclusiva para igrejas, retiros espirituais, acampamentos, congressos e encontros de casais no Sítio Shalom Xerém.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sítio Shalom Xerém | Retiros Espirituais & Eventos Cristãos',
    description: 'Estrutura completa e exclusiva para igrejas, retiros espirituais, acampamentos, congressos e encontros de casais no Sítio Shalom Xerém.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.vimeocdn.com" />
      </head>
      <body className="bg-[#FAF8F5] text-[#1C1917] antialiased selection:bg-[#1B4332] selection:text-white" suppressHydrationWarning>
        <SemZoom />
        {children}
      </body>
    </html>
  );
}


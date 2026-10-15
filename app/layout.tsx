import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

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
      <body className="bg-[#FAF8F5] text-[#1F2937] antialiased selection:bg-[#1B4332] selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}


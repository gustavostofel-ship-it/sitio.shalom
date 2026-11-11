import type { Metadata, Viewport } from 'next';
import { Painel } from '@/components/painel/Painel';

// Área interna: fica fora dos buscadores. Instalável na tela inicial do celular (manifesto + ícone) para receber notificações.
export const metadata: Metadata = {
  title: 'Painel do administrador | Sítio Shalom',
  robots: { index: false, follow: false },
  manifest: '/painel/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Shalom', statusBarStyle: 'default' },
};
export const viewport: Viewport = { themeColor: '#0F291E', width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false };

export default function PainelPage() {
  return <Painel />;
}
